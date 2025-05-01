import Stripe from "stripe";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { bookingDetails, amount } = await req.json();

    console.log("Received request body:", { bookingDetails, amount });

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }

    if (!bookingDetails || !amount) {
      return NextResponse.json(
        { error: "Missing bookingDetails or amount" },
        { status: 400 }
      );
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (
      !bookingDetails.selectedVehicle ||
      !bookingDetails.fullName ||
      !bookingDetails.email ||
      !bookingDetails.pickupLocation ||
      !bookingDetails.dateTime
    ) {
      return NextResponse.json(
        { error: "Missing required booking details" },
        { status: 400 }
      );
    }

    // Generate booking_ref based on the current timestamp
    const now = new Date();
    const booking_ref = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14); // e.g., 20250101-143022

    // Save booking to Supabase with status "pending"
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        full_name: bookingDetails.fullName,
        email: bookingDetails.email,
        phone: bookingDetails.phone || null,
        pickup_location: bookingDetails.pickupLocation,
        dropoff_location: bookingDetails.dropoffLocation || null,
        additional_requests: bookingDetails.additionalRequests || null,
        date_time: bookingDetails.dateTime,
        selected_vehicle: bookingDetails.selectedVehicle,
        amount: amount,
        status: "pending",
        is_hire_by_hour: bookingDetails.isHireByHour || false,
        contact_consent: bookingDetails.contactConsent || false,
        duration: bookingDetails.isHireByHour ? bookingDetails.duration : null,
        duration_unit: bookingDetails.isHireByHour ? bookingDetails.durationUnit : null,
        driver_status: "unassigned",
        booking_ref, 
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Supabase booking error:", bookingError);
      return NextResponse.json(
        { error: "Failed to save booking: " + bookingError.message },
        { status: 500 }
      );
    }

    console.log("Booking created:", booking);

    // Create Stripe checkout session
    const stripeParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${bookingDetails.selectedVehicle} - ${
                bookingDetails.isHireByHour ? "By the Hour" : "One Way"
              }`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        fullName: String(bookingDetails.fullName),
        email: String(bookingDetails.email),
        phone: String(bookingDetails.phone || "N/A"),
        pickup: String(bookingDetails.pickupLocation),
        dropoff: String(bookingDetails.dropoffLocation || "N/A"),
        additionalRequests: String(bookingDetails.additionalRequests || "None"),
        dateTime: String(bookingDetails.dateTime),
        selectedVehicle: String(bookingDetails.selectedVehicle),
        isHireByHour: String(bookingDetails.isHireByHour || false),
        duration: bookingDetails.isHireByHour ? String(bookingDetails.duration) : null,
        durationUnit: bookingDetails.isHireByHour ? String(bookingDetails.durationUnit) : null,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
    };

    const session = await stripe.checkout.sessions.create(stripeParams);

    // Update the booking with the Stripe session ID
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking with Stripe session ID: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to process payment: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}