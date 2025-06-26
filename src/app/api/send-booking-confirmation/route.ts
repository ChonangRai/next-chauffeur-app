import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { sendBookingConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    // Get booking data from Firestore
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const bookingData = bookingDoc.data();

    // Send booking confirmation email
    await sendBookingConfirmationEmail(bookingData);

    return NextResponse.json({ 
      success: true, 
      message: "Booking confirmation email sent successfully" 
    });
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return NextResponse.json(
      { error: "Failed to send booking confirmation email" },
      { status: 500 }
    );
  }
} 