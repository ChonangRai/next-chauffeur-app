export const runtime = 'nodejs';
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { sendPaymentConfirmationEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    console.log("Webhook received");
    
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe signature");
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error("Missing webhook secret");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Webhook event type:", event.type);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    if (event.type === "checkout.session.completed") {
      console.log("Processing checkout.session.completed event");
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.id) {
        console.error("Missing session ID in webhook");
        return NextResponse.json(
          { error: "Missing session ID" },
          { status: 400 }
        );
      }

      console.log("Looking for booking with session ID:", session.id);

      // Query for the booking with this session ID
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("stripe_session_id", "==", session.id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.error("No booking found for session ID:", session.id);
        return NextResponse.json(
          { error: "No booking found for this session" },
          { status: 404 }
        );
      }

      console.log("Found booking, updating payment status");

      // Update the booking status
      const bookingDoc = querySnapshot.docs[0];
      const bookingRef = doc(db, "bookings", bookingDoc.id);
      const bookingData = bookingDoc.data();
      
      try {
        await updateDoc(bookingRef, {
          payment_status: "paid",
          updated_at: new Date()
        });
        console.log("Successfully updated booking payment status");
        
        // Send payment confirmation email only
        try {
          await sendPaymentConfirmationEmail(bookingData);
          console.log("Payment confirmation email sent successfully");
        } catch (emailError) {
          console.error("Failed to send payment confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }
      } catch (updateError) {
        console.error("Failed to update booking:", updateError);
        return NextResponse.json(
          { error: "Failed to update booking status" },
          { status: 500 }
        );
      }

      return NextResponse.json({ received: true });
    }

    console.log("Webhook event processed:", event.type);
    return NextResponse.json({ received: true });
  } catch (err) {
    const error = err as Error;
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook error" },
      { status: 400 }
    );
  }
}
