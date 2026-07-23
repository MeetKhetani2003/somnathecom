
import { Product } from "@/models/Product";

// Paths and config
const DEFAULT_PICKUP_PINCODE = process.env.SHIPROCKET_PICKUP_PINCODE || "380001";

// In-memory cache for Shiprocket JWT token
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

/**
 * Retrieves the Shiprocket authentication token. Uses cached token if valid.
 */
export async function getShiprocketToken(): Promise<string | null> {
  if (process.env.SHIPROCKET_SANDBOX === "true" && (!process.env.SHIPROCKET_EMAIL || process.env.SHIPROCKET_EMAIL.includes("placeholder"))) {
    return "mock_sandbox_token_1234567890";
  }

  const now = Date.now();
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  console.log(process.env.SHIPROCKET_EMAIL);
  console.log(process.env.SHIPROCKET_PASSWORD?.length);
  if (!email || !password) {
    console.warn("[Shiprocket API] Missing credentials in .env.local");
    return null;
  }

  try {
    console.log(`[Shiprocket API] Requesting new auth token from Shiprocket for ${email}...`);
    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Shiprocket API] Login failed: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    console.log(data);
    console.log("[Shiprocket API] Successfully authenticated.");
    if (data && data.token) {
      // Tokens are typically valid for 10 days. We set cache expiration to 8 days.
      cachedToken = data.token;
      tokenExpiry = Date.now() + 8 * 24 * 60 * 60 * 1000;
      return cachedToken;
    }
  } catch (err) {
    console.error("[Shiprocket API] Exception during auth login:", err);
  }

  return null;
}



/**
 * Calculates delivery/shipping charges using Shiprocket Serviceability API.
 * Falls back to a zone-based mock calculation if API is unavailable or dummy credentials are used.
 */
export async function calculateShippingCost(
  deliveryPincode: string,
  weightKg: number,
  declaredValue: number,
  isCod: boolean
): Promise<{ success: boolean; shippingCost: number; message: string }> {
  const weight = weightKg > 0 ? weightKg : 0.5;
  const isCodNum = isCod ? 1 : 0;

  // Zone-based local mock calculation function
  const getMockShippingCost = () => {
    let baseRate = 80;
    const firstDigit = deliveryPincode.charAt(0);

    // Zone 1: Gujarat / Local (pincode starts with 3)
    if (firstDigit === "3") {
      baseRate = 50;
    }
    // Zone 2: Main neighboring regions (1, 2, 4, 5, 6)
    else if (["1", "2", "4", "5", "6"].includes(firstDigit)) {
      baseRate = 80;
    }
    // Zone 3: Remote/North-East (7, 8, 9)
    else {
      baseRate = 110;
    }

    const codFee = isCod ? 40 : 0;
    return baseRate + codFee;
  };

  const token = await getShiprocketToken();

  if (!token) {
    const mockRate = getMockShippingCost();
    console.log(
      `[Shiprocket API] [MOCK MODE] Calculated shipping cost for ${deliveryPincode} (COD: ${isCod}): ₹${mockRate}`
    );
    return {
      success: true,
      shippingCost: mockRate,
      message: "Using mock delivery calculator (demo mode).",
    };
  }

  try {
    const query = new URLSearchParams({
      pickup_postcode: DEFAULT_PICKUP_PINCODE,
      delivery_postcode: deliveryPincode,
      weight: weight.toString(),
      cod: isCodNum.toString(),
      declared_value: declaredValue.toString(),
    });

    console.log(`[Shiprocket API] Querying serviceability for delivery pincode ${deliveryPincode}...`);
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${query.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Serviceability API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (
      data &&
      data.status === 200 &&
      data.data &&
      data.data.available_courier_companies &&
      data.data.available_courier_companies.length > 0
    ) {
      const couriers = data.data.available_courier_companies;

      // Find the cheapest available courier option
      let cheapestRate = Infinity;
      for (const courier of couriers) {
        // Ensure courier is active and has a rate
        const rate = parseFloat(courier.rate);
        if (!isNaN(rate) && rate < cheapestRate) {
          cheapestRate = rate;
        }
      }

      if (cheapestRate !== Infinity) {
        const finalRate = Math.round(cheapestRate);
        console.log(`[Shiprocket API] Serviceability API returned cheapest rate: ₹${finalRate}`);
        return {
          success: true,
          shippingCost: finalRate,
          message: "Shipping calculated successfully.",
        };
      }
    }

    throw new Error("No courier companies available for this pincode.");
  } catch (err: any) {
    const mockRate = getMockShippingCost();
    console.warn(
      `[Shiprocket API] Failed to query live serviceability API (${err.message || err}). Falling back to mock.`
    );
    return {
      success: true,
      shippingCost: mockRate,
      message: `Failed to query live API (${err.message || "Error"}). Used mock fallback.`,
    };
  }
}

/**
 * Creates an order in Shiprocket when a customer places an order on our e-commerce application.
 */
export async function createShiprocketOrder(order: any): Promise<{ success: boolean; shipment_id: string | null; message: string }> {
  const token = await getShiprocketToken();
  const addressDetails = order.shippingDetails;
  const isCod = order.paymentMethod === "cod";

  const firstName = addressDetails.firstName || "Customer";
  const lastName = addressDetails.lastName || "User";

  // Build the order items, fetch SKUs from DB
  const orderItems = [];
  for (const item of order.items) {
    let sku = `SKU-${item.productId}`;
    try {
      const prod = await Product.findOne({ id: item.productId });
      if (prod && prod.sku) {
        sku = prod.sku;
      }
    } catch (dbErr) {
      console.error("[Shiprocket API] Product SKU search failed:", dbErr);
    }

    orderItems.push({
      name: item.title,
      sku: sku,
      units: item.quantity,
      selling_price: item.price,
    });
  }

  const weight = orderItems.reduce((acc, item) => acc + item.units * 0.5, 0);

  const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
  const orderDateStr = isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
  const formattedOrderDate = orderDateStr.replace("T", " ").substring(0, 16);

  const payload = {
    order_id: order._id.toString(),
    order_date: formattedOrderDate,
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "work",

    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addressDetails.street,
    billing_city: addressDetails.city,
    billing_pincode: addressDetails.pincode,
    billing_state: addressDetails.state,
    billing_country: "India",
    billing_email: order.email,
    billing_phone: order.shippingDetails.phone,

    shipping_is_billing: true,
    shipping_customer_name: firstName,
    shipping_last_name: lastName,
    shipping_address: addressDetails.street,
    shipping_city: addressDetails.city,
    shipping_pincode: addressDetails.pincode,
    shipping_state: addressDetails.state,
    shipping_country: "India",
    shipping_email: order.email,
    shipping_phone: order.shippingDetails.phone,

    order_items: orderItems,
    payment_method: isCod ? "COD" : "Prepaid",
    sub_total: isCod ? (order.total - order.shippingCost) : order.total,
    length: 15,
    breadth: 15,
    height: 10,
    weight: weight > 0 ? weight : 0.5,
  };

  if (!token) {
    const mockShipmentId = "SR_MOCK_" + Math.random().toString(36).substring(2, 11).toUpperCase();
    console.log(`[Shiprocket API] [MOCK MODE] Created Shiprocket Order for ID ${order._id.toString()} successfully. Shipment ID: ${mockShipmentId}`);
    return {
      success: true,
      shipment_id: mockShipmentId,
      message: "Order placed in Shiprocket (Mock Mode).",
    };
  }

  try {
    console.log(`[Shiprocket API] Pushing Order #${order._id.toString()} to Shiprocket...`);
    const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data && (data.shipment_id || data.order_id)) {
      const shipmentId = data.shipment_id ? data.shipment_id.toString() : data.order_id.toString();
      console.log(`[Shiprocket API] Order pushed successfully! Shipment ID: ${shipmentId}`);

      // Attempt to assign AWB number immediately
      try {
        console.log(`[Shiprocket API] Assigning AWB for Shipment ID ${shipmentId}...`);
        const awbResponse = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipment_id: shipmentId
          }),
        });

        const awbData = await awbResponse.json();
        console.log(`[Shiprocket API] Full AWB assign response:`, JSON.stringify(awbData, null, 2));
        if (awbResponse.ok && awbData && awbData.awb_assign_status === 1 && awbData.response?.data?.awb_code) {
          const awbCode = awbData.response.data.awb_code.toString();
          console.log(`[Shiprocket API] AWB assigned successfully! AWB Code: ${awbCode}`);
          return {
            success: true,
            shipment_id: awbCode, // Use AWB code as the tracking ID
            message: `Order created and AWB assigned: ${awbCode}`,
          };
        } else {
          console.warn("[Shiprocket API] AWB assign request failed or returned empty:", awbData);
        }
      } catch (awbErr) {
        console.error("[Shiprocket API] Exception during AWB assignment:", awbErr);
      }

      return {
        success: true,
        shipment_id: shipmentId,
        message: "Order created successfully. AWB assignment failed, using shipment ID.",
      };
    } else {
      console.error("[Shiprocket API] Validation errors:", JSON.stringify(data, null, 2));
      const errorMsg = data?.errors ? JSON.stringify(data.errors) : data?.message;
      throw new Error(errorMsg || "Unknown Error");
    }
  } catch (err: any) {
    console.error("[Shiprocket API] Failed to push order to Shiprocket:", err.message || err);
    throw new Error(`Shiprocket Order Creation Failed: ${err.message || "Unknown error"}`);
  }
}

/**
 * Fetches the real AWB / shipment tracking ID from Shiprocket for a given local order ID.
 */
export async function getShiprocketAwbFromApi(orderId: string): Promise<string | null> {
  const token = await getShiprocketToken();
  if (!token) {
    console.log("[Shiprocket API] No token available (Mock Mode / Sandbox).");
    return null;
  }

  try {
    console.log(`[Shiprocket API] Querying Shiprocket for channel_order_id: ${orderId}...`);
    const res = await fetch(`https://apiv2.shiprocket.in/v1/external/orders?channel_order_id=${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.warn(`[Shiprocket API] Failed to fetch order: ${res.status}`);
      return null;
    }

    const data = await res.json();
    console.log(`[Shiprocket API] Full order fetch response:`, JSON.stringify(data, null, 2));
    if (data && data.data && data.data.length > 0) {
      const shiprocketOrder = data.data[0];
      const awbCode = shiprocketOrder.shipments?.[0]?.awb_code || shiprocketOrder.awb_code;
      if (awbCode) {
        console.log(`[Shiprocket API] Found AWB Code: ${awbCode}`);
        return awbCode.toString();
      }

      const shipmentId = shiprocketOrder.shipments?.[0]?.id || shiprocketOrder.shipment_id;
      if (shipmentId) {
        console.log(`[Shiprocket API] Found Shipment ID: ${shipmentId}`);
        return shipmentId.toString();
      }
    }
  } catch (err) {
    console.error("[Shiprocket API] Error fetching order from API:", err);
  }

  return null;
}

/**
 * Fetches the latest tracking status from Shiprocket API for a given AWB or shipment ID.
 * Returns mapped local status: "Processing" | "Shipped" | "Delivered" | "Cancelled" or null.
 */
export async function getShiprocketTrackStatus(trackingNumber: string): Promise<string | null> {
  const token = await getShiprocketToken();
  if (!token) return null;

  try {
    console.log(`[Shiprocket API] Querying status for AWB / Shipment ID: ${trackingNumber}`);
    let response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${trackingNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let data = await response.json();

    // Fallback to shipment tracking if AWB returns empty/error
    if (!response.ok || !data || !data.tracking_data || !data.tracking_data.shipment_track) {
      response = await fetch(
        `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      data = await response.json();
    }

    if (data && data.tracking_data && data.tracking_data.shipment_track) {
      const track = data.tracking_data.shipment_track[0];
      if (track && track.current_status) {
        const statusStr = track.current_status.toLowerCase();
        console.log(`[Shiprocket API] Tracking status received: ${statusStr}`);

        if (statusStr.includes("delivered")) {
          return "Delivered";
        }
        if (
          statusStr.includes("shipped") ||
          statusStr.includes("transit") ||
          statusStr.includes("picked") ||
          statusStr.includes("out for delivery") ||
          statusStr.includes("reached")
        ) {
          return "Shipped";
        }
        if (statusStr.includes("cancelled") || statusStr.includes("canceled")) {
          return "Cancelled";
        }
        return "Processing";
      }
    }
  } catch (err) {
    console.error("[Shiprocket API] Failed to fetch track status:", err);
  }
  return null;
}
