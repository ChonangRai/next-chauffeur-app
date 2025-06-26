import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log("Checking payment status for session:", sessionId);

    // First, check the session status with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Find the booking with this session ID
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("stripe_session_id", "==", sessionId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: "No booking found for this session" },
        { status: 404 }
      );
    }

    // Update the booking status
    const bookingDoc = querySnapshot.docs[0];
    const bookingRef = doc(db, "bookings", bookingDoc.id);
    
    await updateDoc(bookingRef, {
      payment_status: "paid",
      updated_at: new Date()
    });

    console.log("Payment status updated successfully for session:", sessionId);

    return NextResponse.json({ 
      success: true, 
      message: "Payment status updated successfully" 
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
} 