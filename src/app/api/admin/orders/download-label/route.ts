import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const isExchange = searchParams.get("isExchange") === "true";

    if (!orderId) {
      return new Response("Order ID is required", { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    // Create PDF Document
    const pdfDoc = await PDFDocument.create();
    // A6 label: 298 x 420 points
    const page = pdfDoc.addPage([298, 420]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Color definitions
    const borderCol = rgb(0.1, 0.1, 0.1);
    const textCol = rgb(0.1, 0.1, 0.1);
    const purpleCol = rgb(0.24, 0.18, 0.7);
    const lightPurpleCol = rgb(0.94, 0.93, 0.99);
    const mintGreenBg = rgb(0.9, 0.98, 0.92);
    const darkGreenText = rgb(0.0, 0.5, 0.2);
    const lightRedBg = rgb(0.99, 0.92, 0.92);
    const darkRedText = rgb(0.7, 0.1, 0.1);

    // Draw Main Border
    page.drawRectangle({
      x: 5,
      y: 5,
      width: 288,
      height: 410,
      borderColor: borderCol,
      borderWidth: 1.5,
    });

    // 1. TOP HEADER BANNER (y=375 to y=415)
    // Background header band (light purple)
    page.drawRectangle({
      x: 6.5,
      y: 375,
      width: 285,
      height: 38.5,
      color: lightPurpleCol,
    });

    // Sender Title & Subtitle
    page.drawText("SOMNATH NX", { x: 15, y: 398, size: 12, font: boldFont, color: purpleCol });
    page.drawText("PREMIUM NIGHTWEAR STORE", { x: 15, y: 386, size: 7, font: boldFont, color: rgb(0.4, 0.4, 0.4) });

    // Express Shipping Badge (right aligned)
    page.drawRectangle({
      x: 185,
      y: 382,
      width: 100,
      height: 25,
      color: purpleCol,
    });
    page.drawText("EXPRESS SHIPPING", {
      x: 194,
      y: 391,
      size: 7,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    // Header separator line
    page.drawLine({ start: { x: 5, y: 375 }, end: { x: 293, y: 375 }, color: borderCol, thickness: 1.5 });

    // 2. MIDDLE BLOCK COLUMN SEPARATOR (x=150, y=200 to y=375)
    page.drawLine({ start: { x: 150, y: 200 }, end: { x: 150, y: 375 }, color: borderCol, thickness: 1.5 });

    // 3. MIDDLE LEFT COLUMN: SHIP TO & PINCODE (x=5 to x=150)
    page.drawText("SHIP TO (RECIPIENT):", { x: 12, y: 360, size: 8, font: boldFont, color: purpleCol });

    const name = order.shippingDetails?.firstName 
      ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`.trim()
      : "Customer";
    page.drawText(name, { x: 12, y: 348, size: 10, font: boldFont, color: textCol });

    const phone = order.shippingDetails?.phone || "N/A";
    page.drawText(`Contact Phone: ${phone}`, { x: 12, y: 335, size: 8, font: boldFont, color: textCol });

    // Wrap address details into multiple lines
    const rawAddress = isExchange && (order.exchangeDetails as any)?.newAddress 
      ? (order.exchangeDetails as any).newAddress 
      : (order.shippingDetails ? `${order.shippingDetails.street}, ${order.shippingDetails.city}, ${order.shippingDetails.state} - ${order.shippingDetails.pincode}` : "");
    
    const addressWords = rawAddress.split(" ");
    let line1 = "";
    let line2 = "";
    let line3 = "";
    let line4 = "";
    
    for (const word of addressWords) {
      if ((line1 + word).length < 24) {
        line1 += word + " ";
      } else if ((line2 + word).length < 24) {
        line2 += word + " ";
      } else if ((line3 + word).length < 24) {
        line3 += word + " ";
      } else {
        line4 += word + " ";
      }
    }

    page.drawText(`Address: ${line1.trim()}`, { x: 12, y: 320, size: 7.5, font: font, color: textCol });
    if (line2) page.drawText(line2.trim(), { x: 12, y: 310, size: 7.5, font: font, color: textCol });
    if (line3) page.drawText(line3.trim(), { x: 12, y: 300, size: 7.5, font: font, color: textCol });
    if (line4) page.drawText(line4.trim(), { x: 12, y: 290, size: 7.5, font: font, color: textCol });

    // Highlighted Pincode Box (y=210 to y=232)
    const pincode = (order.shippingDetails as any)?.pincode || "400001";
    page.drawRectangle({
      x: 12,
      y: 212,
      width: 126,
      height: 22,
      color: lightPurpleCol,
    });
    page.drawText(`PINCODE: ${pincode}`, { x: 18, y: 220, size: 8.5, font: boldFont, color: purpleCol });

    // 4. MIDDLE RIGHT COLUMN: BARCODE & AWB (x=150 to x=293)
    let barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(order._id.toString())}&scale=2&rotate=N&includetext=false`;
    const trackingNo = order.trackingNumber || "SR234692909432";
    if (order.trackingNumber) {
      barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(order.trackingNumber)}&scale=2&rotate=N&includetext=false`;
    }

    try {
      const barcodeRes = await fetch(barcodeUrl);
      if (barcodeRes.ok) {
        const barcodeBuffer = await barcodeRes.arrayBuffer();
        const barcodeImg = await pdfDoc.embedPng(barcodeBuffer);
        page.drawImage(barcodeImg, {
          x: 155,
          y: 285,
          width: 133,
          height: 68,
        });
      }
    } catch (err) {
      console.error("Barcode load error:", err);
      page.drawText("[BARCODE ERROR]", { x: 160, y: 310, size: 8, font: boldFont });
    }

    page.drawText(`AWB NO: ${trackingNo}`, { x: 156, y: 270, size: 8, font: boldFont, color: textCol });

    // Barcode Separator line (y=258)
    page.drawLine({ start: { x: 150, y: 258 }, end: { x: 293, y: 258 }, color: borderCol, thickness: 1 });

    // Package specification (y=200 to y=258)
    page.drawText("PRODUCT DETAIL:", { x: 156, y: 247, size: 7, font: boldFont, color: purpleCol });
    const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    page.drawText(`Date: ${formattedDate}`, { x: 156, y: 238, size: 7, font: font, color: textCol });

    let specY = 228;
    const specItems = isExchange && (order.exchangeDetails as any)?.newSizes 
      ? (order.exchangeDetails as any).newSizes.map((exItem: any) => {
          const matchingOriginalItem = order.items.find((orig: any) => orig.productId === exItem.productId);
          return {
            title: matchingOriginalItem ? matchingOriginalItem.title : `Product ID ${exItem.productId}`,
            quantity: 1,
            size: exItem.size,
            color: exItem.color || matchingOriginalItem?.color || "N/A"
          };
        })
      : order.items.map((item: any) => ({
          title: item.title,
          quantity: item.quantity,
          size: item.size || "Std",
          color: item.color || "N/A"
        }));

    for (let i = 0; i < Math.min(specItems.length, 2); i++) {
      const item = specItems[i];
      const nameStr = `${item.title.substring(0, 12)} (Qty: ${item.quantity})`;
      page.drawText(nameStr, { x: 156, y: specY, size: 7, font: boldFont, color: textCol });
      const varStr = `Size: ${item.size} | Color: ${item.color}`;
      page.drawText(varStr, { x: 156, y: specY - 8, size: 6.5, font: font, color: textCol });
      specY -= 17;
    }

    if (specItems.length > 2) {
      page.drawText("+ More items...", { x: 156, y: specY, size: 6, font: font, color: purpleCol });
    }

    // Middle separator line
    page.drawLine({ start: { x: 5, y: 200 }, end: { x: 293, y: 200 }, color: borderCol, thickness: 1.5 });

    // 5. LOWER BLOCK COLUMN SEPARATOR (x=150, y=105 to y=200)
    page.drawLine({ start: { x: 150, y: 105 }, end: { x: 150, y: 200 }, color: borderCol, thickness: 1.5 });

    // 6. LOWER LEFT COLUMN: FROM / RETURN TO (x=5 to x=150)
    page.drawText("FROM / RETURN TO:", { x: 12, y: 188, size: 8, font: boldFont, color: purpleCol });
    page.drawText("Somnath NX Costumes", { x: 12, y: 177, size: 9, font: boldFont, color: textCol });
    page.drawText("Anand Nagar Main Road, Oppo Harsad Prov.", { x: 12, y: 167, size: 6.5, font: font, color: textCol });
    page.drawText("Rajkot, Gujarat - 360002", { x: 12, y: 157, size: 6.5, font: font, color: textCol });
    page.drawText("Contact: 8866331293", { x: 12, y: 147, size: 6.5, font: boldFont, color: textCol });

    // 7. LOWER RIGHT COLUMN: ITEMS CHECKLIST & SIZES (x=150 to x=293)
    page.drawText("ITEMS CHECKLIST & SIZES:", { x: 156, y: 188, size: 8, font: boldFont, color: purpleCol });

    let currentY = 175;
    if (isExchange && (order.exchangeDetails as any)?.newSizes) {
      for (const exItem of (order.exchangeDetails as any).newSizes) {
        const matchingOriginalItem = order.items.find((orig: any) => orig.productId === exItem.productId);
        const title = matchingOriginalItem ? matchingOriginalItem.title : `Product ID ${exItem.productId}`;
        const color = exItem.color || matchingOriginalItem?.color || "N/A";
        const textStr = `[] ${title.substring(0, 14)} (Size: ${exItem.size}) | Col: ${color}`;
        page.drawText(textStr, { x: 156, y: currentY, size: 7, font: font, color: textCol });
        currentY -= 12;
      }
    } else {
      for (const item of order.items) {
        const textStr = `[] ${item.title.substring(0, 14)} (Qty: ${item.quantity}) | Size: ${item.size || "Std"}`;
        page.drawText(textStr, { x: 156, y: currentY, size: 7, font: font, color: textCol });
        currentY -= 12;
      }
    }

    // Lower separator line
    page.drawLine({ start: { x: 5, y: 105 }, end: { x: 293, y: 105 }, color: borderCol, thickness: 1.5 });

    // 8. BOTTOM FOOTER BANNER (y=5 to y=105)
    const isCod = order.paymentMethod === "cod";
    const isExchangeCod = isExchange && ((order.exchangeDetails as any)?.paymentMethod === "cod");
    const isBannerCod = isExchange ? isExchangeCod : isCod;

    let collectAmount = 0;
    if (isExchange) {
      collectAmount = isExchangeCod ? 120 : 0;
    } else {
      collectAmount = isCod ? (order.total - order.shippingCost) : 0;
    }

    // Draw Footer Background band
    page.drawRectangle({
      x: 6.5,
      y: 6.5,
      width: 285,
      height: 97,
      color: isBannerCod ? lightRedBg : mintGreenBg,
    });

    if (isBannerCod) {
      page.drawText("COD - CASH ON DELIVERY", { x: 15, y: 72, size: 14, font: boldFont, color: darkRedText });
      page.drawText(`TOTAL COLLECTABLE BILL: Rs. ${collectAmount}`, { x: 15, y: 52, size: 10, font: boldFont, color: darkRedText });
      page.drawText("PLEASE COLLECT CASH BEFORE HANDING OVER PACKAGE", { x: 15, y: 35, size: 7, font: font, color: darkRedText });
    } else {
      page.drawText("PREPAID - ONLINE SECURED", { x: 15, y: 72, size: 14, font: boldFont, color: darkGreenText });
      page.drawText("TOTAL COLLECTABLE BILL: Rs. 0", { x: 15, y: 52, size: 10, font: boldFont, color: darkGreenText });
      page.drawText("NO CASH PAYMENT TO BE COLLECTED FROM CUSTOMER", { x: 15, y: 35, size: 7, font: font, color: darkGreenText });
    }

    // Embed QR Code inside the footer right side for instant scanner tracking
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      JSON.stringify({
        orderId: order._id.toString(),
        name: order.shippingDetails?.firstName ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`.trim() : "Customer",
        total: order.total,
        status: order.shippingStatus,
        payment: order.paymentStatus
      })
    )}`;

    try {
      const qrRes = await fetch(qrUrl);
      if (qrRes.ok) {
        const qrBuffer = await qrRes.arrayBuffer();
        const qrImg = await pdfDoc.embedPng(qrBuffer);
        page.drawImage(qrImg, {
          x: 215,
          y: 15,
          width: 65,
          height: 65,
        });
      }
    } catch (err) {
      console.error("QR load error:", err);
    }

    // Save and return
    const pdfBytes = await pdfDoc.save();
    return new Response(new Uint8Array(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Label_${isExchange ? "Exchange_" : ""}${orderId}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error("Error creating label PDF:", error);
    return new Response(error.message || "Label generation error", { status: 500 });
  }
}
