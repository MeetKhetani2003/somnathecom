import fs from "fs";
import path from "path";
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: String,
  email: String,
  total: Number,
  shippingCost: Number,
  paymentMethod: String,
  paymentStatus: String,
  trackingNumber: String,
  createdAt: Date,
  shippingDetails: {
    name: String,
    address: String,
    phone: String
  }
});

function parseAddressDetails(addressStr) {
  const pincodeMatch = addressStr.match(/\b\d{6}\b/);
  
  if (!pincodeMatch) {
    let streetVal = addressStr.trim() || "Not Provided";
    if (streetVal.length < 10) {
      streetVal = streetVal + " - Detailed Address Info";
    }
    return {
      street: streetVal,
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380001",
    };
  }

  const pincode = pincodeMatch[0];
  let cleanAddress = addressStr.replace(/\b\d{6}\b/, "").trim();
  cleanAddress = cleanAddress.replace(/[-\s,]+$/, "").trim();

  const parts = cleanAddress.split(",").map((p) => p.trim()).filter(Boolean);

  let city = "Ahmedabad";
  let state = "Gujarat";
  let street = cleanAddress;

  if (parts.length >= 2) {
    state = parts[parts.length - 1];
    city = parts[parts.length - 2];
    street = parts.slice(0, parts.length - 2).join(", ") || city;
  } else if (parts.length === 1) {
    const words = parts[0].split(/\s+/).map((w) => w.trim()).filter(Boolean);
    if (words.length >= 3) {
      city = words[words.length - 1];
      street = words.slice(0, words.length - 1).join(" ");
    } else if (words.length === 2) {
      city = words[1];
      street = words[0];
    } else {
      city = words[0] || "Ahmedabad";
      street = words[0] || "Not Provided";
    }
  }

  let finalStreet = street || "Not Provided";
  if (finalStreet.length < 10) {
    finalStreet = finalStreet + " - Detailed Address Info";
  }

  return {
    street: finalStreet,
    city: city || "Ahmedabad",
    state: state || "Gujarat",
    pincode,
  };
}

async function check() {
  const envPath = path.join(process.cwd(), ".env.local");
  const envContent = fs.readFileSync(envPath, "utf8");
  let mongoUri = "";
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const parts = trimmed.split("=");
    if (parts.length >= 2) {
      if (parts[0].trim() === "MONGODB_URI") mongoUri = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  });

  await mongoose.connect(mongoUri);
  const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
  const latestOrder = await Order.findOne({}).sort({ createdAt: -1 });

  if (latestOrder) {
    console.log("Order ID:", latestOrder._id.toString());
    console.log("Address entered by customer:", latestOrder.shippingDetails.address);
    const parsed = parseAddressDetails(latestOrder.shippingDetails.address);
    console.log("Parsed Address Details:", JSON.stringify(parsed, null, 2));

    const nameParts = latestOrder.shippingDetails.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "User";

    const payload = {
      order_id: latestOrder._id.toString(),
      order_date: new Date(latestOrder.createdAt).toISOString().replace("T", " ").substring(0, 16),
      pickup_location: "Primary",
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: parsed.street,
      billing_city: parsed.city,
      billing_pincode: parsed.pincode,
      billing_state: parsed.state,
      billing_country: "India",
      billing_email: latestOrder.email,
      billing_phone: latestOrder.shippingDetails.phone,
      shipping_is_billing: true,
      shipping_customer_name: firstName,
      shipping_last_name: lastName,
      shipping_address: parsed.street,
      shipping_city: parsed.city,
      shipping_pincode: parsed.pincode,
      shipping_state: parsed.state,
      shipping_country: "India",
      shipping_email: latestOrder.email,
      shipping_phone: latestOrder.shippingDetails.phone,
    };

    console.log("Shiprocket Order Payload constructed:", JSON.stringify(payload, null, 2));
  } else {
    console.log("No orders found");
  }

  await mongoose.disconnect();
}

check();
