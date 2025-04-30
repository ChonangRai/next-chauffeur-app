import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

export async function POST(req: Request) {
  try {
    const { booking } = await req.json();

    if (!booking) {
      return NextResponse.json({ error: "Booking data is required" }, { status: 400 });
    }

    // Create a new PDF document
    const doc = new PDFDocument();
    let buffers: Buffer[] = [];

    doc.on("data", (buffer) => buffers.push(buffer));
    doc.on("end", () => {});

    // Invoice Header
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.fontSize(12).text(`Booking ID: ${booking.id}`, { align: "center" });
    doc.moveDown();

    // Company Info
    doc.fontSize(10).text("Luxury Car Booking Service", { align: "left" });
    doc.text("123 Business St, City, Country", { align: "left" });
    doc.text("Email: support@luxurycars.com", { align: "left" });
    doc.moveDown();

    // Customer Info
    doc.fontSize(12).text("Bill To:", { underline: true });
    doc.fontSize(10).text(`Name: ${booking.full_name}`);
    doc.text(`Email: ${booking.email}`);
    doc.text(`Phone: ${booking.phone || "N/A"}`);
    doc.moveDown();

    // Booking Details
    doc.fontSize(12).text("Booking Details:", { underline: true });
    doc.fontSize(10).text(`Service Type: ${booking.is_hire_by_hour ? "Hire By Hour" : "One Way"}`);
    doc.text(`Pickup: ${booking.pickup_location}`);
    doc.text(`Dropoff: ${booking.dropoff_location || "N/A"}`);
    doc.text(`Date/Time: ${new Date(booking.date_time).toLocaleString()}`);
    doc.text(`Car: ${booking.selected_car}`);
    doc.text(`Amount: £${booking.amount.toFixed(2)}`);
    doc.text(`Status: ${booking.status}`);
    if (booking.is_hire_by_hour) {
      doc.text(`Duration: ${booking.duration} ${booking.duration_unit}`);
    }
    doc.moveDown();

    // Footer
    doc.fontSize(10).text("Thank you for your business!", { align: "center" });

    // Finalize the PDF
    doc.end();

    // Wait for the PDF to be fully generated
    await new Promise<void>((resolve) => {
      doc.on("end", () => resolve());
    });

    // Combine buffers into a single Buffer
    const pdfBuffer = Buffer.concat(buffers);

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${booking.id}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}