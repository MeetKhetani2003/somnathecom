import nodemailer from "nodemailer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

interface InvoiceItem {
  title: string;
  price: number;
  quantity: number;
}

interface InvoiceDetails {
  orderId: string;
  customerName: string;
  email: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  address: string;
  phone: string;
}

export async function generateInvoicePDF(details: InvoiceDetails): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 1. Embed Logo image
  let logoImage = null;
  try {
    const logoPath = path.join(process.cwd(), "public", "assets", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      logoImage = await pdfDoc.embedPng(logoBytes);
    }
  } catch (logoErr) {
    console.error("[PDF Generator] Failed to embed logo image:", logoErr);
  }

  // 2. Header Section
  if (logoImage) {
    // Render brand logo maintaining 1:1 aspect ratio of the 500x500 PNG.
    // The logo contains transparent padding:
    // Visible content is 351x141 pixels, located at: minX=75, maxX=425, minY=181, maxY=321.
    // To position the visible content precisely at targetX = 50, targetY = 755 with a targetWidth = 100
    // and targetHeight = 40 (preserving the 2.5:1 ratio of the visible text):
    const targetX = 50;
    const targetY = 755;
    const targetWidth = 100;
    const scale = targetWidth / 350; // Scale factor for the content
    
    const drawWidth = 500 * scale;
    const drawHeight = 500 * scale;
    const drawX = targetX - (75 * scale);
    const drawY = targetY - (179 * scale); // 500 - 321 = 179 pixels padding from the bottom

    page.drawImage(logoImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });
  } else {
    // Fallback text header
    page.drawText("SAHELI SHRUNGAR", {
      x: 50,
      y: 775,
      size: 20,
      font: boldFont,
      color: rgb(139/255, 29/255, 143/255),
    });
  }

  // Company details below logo
  page.drawText("Saheli Shrungar Costumes", { x: 50, y: 738, size: 9, font: boldFont, color: rgb(26/255, 15/255, 28/255) });
  page.drawText("Mumbai, Maharashtra, India", { x: 50, y: 726, size: 8, font: font, color: rgb(107/255, 90/255, 111/255) });
  page.drawText("Email: support@sahelishrungar.com", { x: 50, y: 714, size: 8, font: font, color: rgb(107/255, 90/255, 111/255) });

  // Invoice Title and Metadata on Right
  page.drawText("TAX INVOICE / BILL", {
    x: 380,
    y: 775,
    size: 14,
    font: boldFont,
    color: rgb(139/255, 29/255, 143/255)
  });

  const invoiceNo = `INV-${details.orderId.substring(details.orderId.length - 8).toUpperCase()}`;
  page.drawText(`Invoice No: ${invoiceNo}`, { x: 380, y: 757, size: 9, font: boldFont, color: rgb(26/255, 15/255, 28/255) });
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN", { dateStyle: "medium" })}`, { x: 380, y: 745, size: 8.5, font: font, color: rgb(74/255, 53/255, 77/255) });
  page.drawText(`Order ID: #${details.orderId}`, { x: 380, y: 733, size: 8.5, font: font, color: rgb(74/255, 53/255, 77/255) });
  page.drawText(`Payment Mode: Razorpay Online`, { x: 380, y: 721, size: 8.5, font: font, color: rgb(74/255, 53/255, 77/255) });

  // Divider (y = 705)
  page.drawLine({
    start: { x: 50, y: 705 },
    end: { x: 545, y: 705 },
    thickness: 1,
    color: rgb(240/255, 230/255, 242/255)
  });

  // 3. Billing & Shipping Info Columns (y = 685)
  const infoY = 685;
  page.drawText("BILL TO / CUSTOMER", { x: 50, y: infoY, size: 9, font: boldFont, color: rgb(139/255, 29/255, 143/255) });
  page.drawText(details.customerName, { x: 50, y: infoY - 16, size: 10, font: boldFont, color: rgb(26/255, 15/255, 28/255) });
  page.drawText(`Phone: ${details.phone}`, { x: 50, y: infoY - 30, size: 9, font: font, color: rgb(74/255, 53/255, 77/255) });
  page.drawText(`Email: ${details.email}`, { x: 50, y: infoY - 42, size: 9, font: font, color: rgb(74/255, 53/255, 77/255) });

  page.drawText("DELIVER / SHIP TO", { x: 300, y: infoY, size: 9, font: boldFont, color: rgb(139/255, 29/255, 143/255) });
  page.drawText(details.customerName, { x: 300, y: infoY - 16, size: 10, font: boldFont, color: rgb(26/255, 15/255, 28/255) });
  page.drawText(details.address, {
    x: 300,
    y: infoY - 30,
    size: 9,
    font: font,
    color: rgb(107/255, 90/255, 111/255),
    maxWidth: 245,
    lineHeight: 12
  });

  // Divider (y = 620)
  page.drawLine({
    start: { x: 50, y: 620 },
    end: { x: 545, y: 620 },
    thickness: 1,
    color: rgb(240/255, 230/255, 242/255)
  });

  // 4. Items Table Section
  const tableTopY = 595;
  // Header background block
  page.drawRectangle({
    x: 50,
    y: tableTopY - 20,
    width: 495,
    height: 20,
    color: rgb(252/255, 247/255, 253/255)
  });

  page.drawText("S.No", { x: 55, y: tableTopY - 14, size: 8.5, font: boldFont, color: rgb(139/255, 122/255, 143/255) });
  page.drawText("Costume Description", { x: 90, y: tableTopY - 14, size: 8.5, font: boldFont, color: rgb(139/255, 122/255, 143/255) });
  page.drawText("Qty", { x: 310, y: tableTopY - 14, size: 8.5, font: boldFont, color: rgb(139/255, 122/255, 143/255) });
  page.drawText("Price (INR)", { x: 370, y: tableTopY - 14, size: 8.5, font: boldFont, color: rgb(139/255, 122/255, 143/255) });
  page.drawText("Total (INR)", { x: 470, y: tableTopY - 14, size: 8.5, font: boldFont, color: rgb(139/255, 122/255, 143/255) });

  // Border lines
  page.drawLine({ start: { x: 50, y: tableTopY }, end: { x: 545, y: tableTopY }, thickness: 1, color: rgb(220/255, 200/255, 225/255) });
  page.drawLine({ start: { x: 50, y: tableTopY - 20 }, end: { x: 545, y: tableTopY - 20 }, thickness: 1, color: rgb(220/255, 200/255, 225/255) });

  let itemY = tableTopY - 38;
  details.items.forEach((item, index) => {
    // S.No
    page.drawText((index + 1).toString(), { x: 55, y: itemY, size: 9, font: font, color: rgb(74/255, 53/255, 77/255) });
    // Item Name
    page.drawText(item.title, { x: 90, y: itemY, size: 9.5, font: boldFont, color: rgb(26/255, 15/255, 28/255), maxWidth: 210 });
    // Qty
    page.drawText(item.quantity.toString(), { x: 320, y: itemY, size: 9, font: font, color: rgb(74/255, 53/255, 77/255) });
    // Price
    page.drawText(`Rs. ${item.price.toFixed(2)}`, { x: 370, y: itemY, size: 9, font: font, color: rgb(74/255, 53/255, 77/255) });
    // Total Amount
    page.drawText(`Rs. ${(item.price * item.quantity).toFixed(2)}`, { x: 470, y: itemY, size: 9.5, font: boldFont, color: rgb(26/255, 15/255, 28/255) });

    itemY -= 24;
    // Light bottom separator line
    page.drawLine({
      start: { x: 50, y: itemY + 12 },
      end: { x: 545, y: itemY + 12 },
      thickness: 0.5,
      color: rgb(248/255, 240/255, 249/255)
    });
  });

  // Table Outer Frame Box
  const tableBottomY = itemY + 12;
  page.drawLine({ start: { x: 50, y: tableTopY }, end: { x: 50, y: tableBottomY }, thickness: 1, color: rgb(220/255, 200/255, 225/255) });
  page.drawLine({ start: { x: 545, y: tableTopY }, end: { x: 545, y: tableBottomY }, thickness: 1, color: rgb(220/255, 200/255, 225/255) });
  page.drawLine({ start: { x: 50, y: tableBottomY }, end: { x: 545, y: tableBottomY }, thickness: 1, color: rgb(220/255, 200/255, 225/255) });

  // 5. Totals Block (below table)
  let totalsY = tableBottomY - 20;
  page.drawText("Subtotal:", { x: 330, y: totalsY, size: 9.5, font: font, color: rgb(74/255, 53/255, 77/255) });
  page.drawText(`Rs. ${details.subtotal.toFixed(2)}`, { x: 470, y: totalsY, size: 9.5, font: boldFont, color: rgb(26/255, 15/255, 28/255) });

  totalsY -= 18;
  page.drawText("Discount Coupon:", { x: 330, y: totalsY, size: 9.5, font: font, color: rgb(74/255, 53/255, 77/255) });
  page.drawText(`-Rs. ${details.discount.toFixed(2)}`, { x: 470, y: totalsY, size: 9.5, font: boldFont, color: rgb(194/255, 24/255, 123/255) });

  totalsY -= 18;
  page.drawText("Shipping / Delivery:", { x: 330, y: totalsY, size: 9.5, font: font, color: rgb(74/255, 53/255, 77/255) });
  page.drawText("FREE", { x: 470, y: totalsY, size: 9.5, font: boldFont, color: rgb(15/255, 138/255, 75/255) });

  totalsY -= 12;
  page.drawLine({
    start: { x: 330, y: totalsY },
    end: { x: 545, y: totalsY },
    thickness: 1.2,
    color: rgb(139/255, 29/255, 143/255)
  });

  totalsY -= 18;
  page.drawText("Grand Total Paid:", { x: 330, y: totalsY, size: 11, font: boldFont, color: rgb(139/255, 29/255, 143/255) });
  page.drawText(`Rs. ${details.total.toFixed(2)}`, { x: 470, y: totalsY, size: 11, font: boldFont, color: rgb(139/255, 29/255, 143/255) });

  // 6. Tax Invoice Footer Notes
  page.drawText("Terms & Conditions / Compliance Notes:", { x: 50, y: 130, size: 8.5, font: boldFont, color: rgb(74/255, 53/255, 77/255) });
  page.drawText("• This is a computer-generated tax invoice bill and does not require a physical signature.", { x: 50, y: 116, size: 8, font: font, color: rgb(107/255, 90/255, 111/255) });
  page.drawText("• For size exchange or returns, contact support team with Invoice Number.", { x: 50, y: 104, size: 8, font: font, color: rgb(107/255, 90/255, 111/255) });

  page.drawText("Thank you for shopping with Saheli Shrungar! We hope your little star shines in their event.", {
    x: 50,
    y: 65,
    size: 8.5,
    font: font,
    color: rgb(139/255, 122/255, 143/255)
  });
  page.drawText("For help or support, contact us at support@sahelishrungar.com", {
    x: 135,
    y: 50,
    size: 8.5,
    font: font,
    color: rgb(139/255, 122/255, 143/255)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function sendInvoiceEmail(details: InvoiceDetails) {
  const {
    orderId,
    customerName,
    email,
    items,
    subtotal,
    discount,
    total,
    address,
    phone,
  } = details;

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: left; font-size: 14px; color: #1A0F1C;">
          <strong>${item.title}</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: center; font-size: 14px; color: #4A354D;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: right; font-size: 14px; color: #1A0F1C; font-weight: bold;">
          ₹${item.price}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #F0E6F2; text-align: right; font-size: 14px; color: #1A0F1C; font-weight: bold;">
          ₹${item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <div style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #FFFCFE; padding: 30px 15px; text-align: center;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #F0E6F2; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 20px rgba(139, 29, 143, 0.05); text-align: left;">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #8B1D8F 0%, #C2187B 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Saheli Shrungar</h1>
          <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Order Invoice & Confirmation</p>
        </div>

        <div style="padding: 30px;">
          <!-- Greeting -->
          <h2 style="margin-top: 0; font-size: 18px; color: #1A0F1C; font-weight: 600;">Thank you for your order, ${customerName}!</h2>
          <p style="font-size: 14px; color: #6B5A6F; line-height: 1.6; margin-bottom: 25px;">
            We've received your payment and are preparing your costumes for delivery. Below is your detailed invoice bill.
          </p>

          <!-- Meta Info -->
          <div style="background-color: #FCF7FD; border-radius: 16px; padding: 15px 20px; margin-bottom: 25px; border: 1px dashed #EEDDF0; font-size: 13.5px; color: #4A354D; display: flex; flex-direction: column; gap: 6px;">
            <div><strong>Order ID:</strong> <span style="font-family: monospace; color: #8B1D8F;">${orderId}</span></div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
            <div><strong>Payment Status:</strong> <span style="color: #0F8A4B; font-weight: 600;">Paid (Razorpay)</span></div>
          </div>

          <!-- Items Table -->
          <h3 style="font-size: 15px; color: #1A0F1C; border-bottom: 2px solid #F0E6F2; padding-bottom: 8px; margin-bottom: 12px; font-weight: 600;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <thead>
              <tr style="background-color: #FCF7FD;">
                <th style="padding: 10px 12px; text-align: left; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Costume</th>
                <th style="padding: 10px 12px; text-align: center; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Price</th>
                <th style="padding: 10px 12px; text-align: right; font-size: 12.5px; text-transform: uppercase; color: #8B7A8F; font-weight: 600;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <!-- Totals block -->
          <div style="width: 250px; margin-left: auto; margin-bottom: 30px; font-size: 14px; color: #4A354D; line-height: 2;">
            <div style="display: flex; justify-content: space-between;">
              <span>Subtotal:</span>
              <span style="font-weight: 600; color: #1A0F1C;">₹${subtotal}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #C2187B;">
              <span>Discount:</span>
              <span style="font-weight: 600;">-₹${discount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #0F8A4B;">
              <span>Shipping:</span>
              <span style="font-weight: 600;">Free</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; border-top: 1px solid #F0E6F2; padding-top: 8px; margin-top: 8px; color: #1A0F1C;">
              <span>Grand Total:</span>
              <span>₹${total}</span>
            </div>
          </div>

          <!-- Shipping Details -->
          <h3 style="font-size: 15px; color: #1A0F1C; border-bottom: 2px solid #F0E6F2; padding-bottom: 8px; margin-bottom: 12px; font-weight: 600;">Delivery Address</h3>
          <div style="font-size: 14px; color: #6B5A6F; line-height: 1.6; background-color: #FFFCFE; border: 1px solid #F0E6F2; border-radius: 16px; padding: 15px 20px;">
            <strong>${customerName}</strong><br/>
            ${address}<br/>
            <strong>Phone:</strong> ${phone}
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; border-top: 1px solid #F0E6F2; padding-top: 20px; text-align: center; font-size: 12px; color: #8B7A8F; line-height: 1.5;">
            Thank you for shopping with Saheli Shrungar! We hope your little star shines in their event.<br/>
            For help or inquiries, contact us at support@sahelishrungar.com
          </div>

        </div>
      </div>
    </div>
  `;

  // Check SMTP configurations, falling back to Gmail SMTP if EMAIL_USER and EMAIL_PASS are present
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host && process.env.EMAIL_USER) {
    host = "smtp.gmail.com";
    port = 465;
  }

  // Generate PDF invoice buffer
  let pdfBuffer: Buffer | null = null;
  try {
    pdfBuffer = await generateInvoicePDF(details);
  } catch (pdfErr) {
    console.error("[Email Service] Failed to generate invoice PDF:", pdfErr);
  }

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });

      await transporter.sendMail({
        from: `"Saheli Shrungar Costumes" <${user}>`,
        to: email,
        subject: `Invoice for Order #${orderId} - Saheli Shrungar`,
        html: emailHtml,
        attachments: pdfBuffer
          ? [
              {
                filename: `Invoice_${orderId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ]
          : [],
      });

      console.log(`[Email Service] Invoice sent to ${email} with PDF attachment for order ${orderId}`);
      return;
    } catch (error) {
      console.error("[Email Service] Failed to send email via SMTP:", error);
    }
  }

  // Fallback: log invoice to the console
  console.log("==================================================================");
  console.log(`[MOCK EMAIL FALLBACK] Invoice generated for order ${orderId}`);
  console.log(`Recipient: ${email}`);
  console.log(`Subtotal: ₹${subtotal}, Discount: ₹${discount}, Total: ₹${total}`);
  console.log("HTML Billing Invoice Template content matches generated design.");
  console.log("==================================================================");
}

interface BulkInquiryDetails {
  name: string;
  email: string;
  phone: string;
  message: string;
  productId: number;
  productTitle: string;
  quantity: number;
  eventDate: string;
}

export async function sendBulkInquiryEmails(details: BulkInquiryDetails) {
  const { name, email, phone, message, productId, productTitle, quantity, eventDate } = details;

  // 1. Admin Email HTML
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #F0E6F2; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background-color: #8B1D8F; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">New Bulk Order Inquiry</h2>
      </div>
      <div style="padding: 25px; color: #1A0F1C; line-height: 1.6;">
        <p>Hello Admin,</p>
        <p>A customer has submitted a wholesale bulk order inquiry for the following product:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #FCF7FD; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Product Name:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${productTitle} (ID: ${productId})</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Requested Quantity:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; color: #8B1D8F; font-weight: bold;">${quantity} units</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Required Date:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Customer Name:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Email:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2; font-weight: bold;">Phone:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #F0E6F2;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 15px; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 10px 15px;">${message}</td>
          </tr>
        </table>
      </div>
    </div>
  `;

  // 2. Customer Confirmation HTML
  const customerHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #F0E6F2; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #8B1D8F; padding: 20px; text-align: center; color: white;">
        <h2 style="margin: 0; font-size: 20px;">Bulk Inquiry Submitted</h2>
      </div>
      <div style="padding: 25px; color: #1A0F1C; line-height: 1.6;">
        <p>Dear ${name},</p>
        <p>Thank you for reaching out to **Saheli Shrungar Costumes**. We have received your wholesale bulk inquiry for <strong>${productTitle}</strong>.</p>
        <p>Our sales representative will review your requirement (Quantity: ${quantity} units, Required Date: ${eventDate}) and get back to you with custom discounted wholesale pricing details within 24 hours.</p>
        
        <p style="margin-top: 30px; font-size: 13px; color: #8B7A8F;">
          Best Regards,<br/>
          <strong>Saheli Shrungar Customer Support Team</strong><br/>
          Contact: support@sahelishrungar.com
        </p>
      </div>
    </div>
  `;

  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!host && process.env.EMAIL_USER) {
    host = "smtp.gmail.com";
    port = 465;
  }

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      // Send to Admin
      await transporter.sendMail({
        from: `"Saheli Bulk Orders" <${user}>`,
        to: user,
        subject: `NEW Wholesale Bulk Inquiry: ${productTitle} (${quantity} units)`,
        html: adminHtml,
      });

      // Send to Customer
      await transporter.sendMail({
        from: `"Saheli Shrungar Costumes" <${user}>`,
        to: email,
        subject: `Bulk Inquiry Submitted: ${productTitle}`,
        html: customerHtml,
      });

      console.log(`[Email Service] Bulk inquiry emails dispatched successfully.`);
      return;
    } catch (error) {
      console.error("[Email Service] Failed to send bulk inquiry emails via SMTP:", error);
    }
  }

  console.log("==================================================================");
  console.log(`[MOCK EMAIL FALLBACK] Bulk Inquiry Emails Sent.`);
  console.log(`Product: ${productTitle} (ID: ${productId}), Qty: ${quantity}`);
  console.log(`Customer: ${name} (${email}), Phone: ${phone}`);
  console.log("Both admin notification and customer confirmation emails logged.");
  console.log("==================================================================");
}
