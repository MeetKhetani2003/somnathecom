import dbConnect from "@/utils/dbConnect";
import { Order } from "@/models/Order";
import { generateInvoicePDF } from "@/utils/emailService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return new Response("Order ID is required", { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(orderId);

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    if (!order.shippingDetails) {
      return new Response("Order shipping details are missing", { status: 400 });
    }

    const pdfBuffer = await generateInvoicePDF({
      orderId: order._id.toString(),
      customerName: order.shippingDetails.name,
      email: order.email,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      address: order.shippingDetails.address,
      phone: order.shippingDetails.phone,
    });

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${orderId}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating download invoice PDF:", error);
    return new Response(error.message || "Failed to download PDF", { status: 500 });
  }
}
