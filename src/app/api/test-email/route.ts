import { NextResponse } from "next/server";
import { sendBookingConfirmationEmail, sendPaymentConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, testType } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Test booking data
    const testBookingData = {
      booking_ref: "TEST-20241201-ABC123",
      email: email,
      full_name: "Test User",
      service_type: "Airport Transfer",
      date_time: new Date().toISOString(),
      pickup_location: "London Heathrow Airport",
      dropoff_location: "Central London",
      passengers: 2,
      bags: 2,
      amount: 150.00,
      status: "confirmed",
      payment_status: "paid"
    };

    let result;
    
    if (testType === "payment") {
      result = await sendPaymentConfirmationEmail(testBookingData);
    } else {
      result = await sendBookingConfirmationEmail(testBookingData);
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: `${testType === "payment" ? "Payment" : "Booking"} confirmation email sent successfully` 
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
} 