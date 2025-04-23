import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe webhook secret (set this in Vercel environment variables after creating the webhook in Stripe)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing Stripe signature" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get the booking ID from the session metadata
      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.error("Booking ID not found in session metadata");
        return NextResponse.json(
          { error: "Booking ID not found" },
          { status: 400 }
        );
      }

      // Update the booking status to "confirmed"
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId)
        .eq("stripe_session_id", session.id);

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json(
          { error: "Failed to update booking status" },
          { status: 500 }
        );
      }

      console.log(`Booking ${bookingId} confirmed`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}