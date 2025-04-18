import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed.", err);
        return new NextResponse("Webhook error", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const booking = {
            full_name: session.metadata?.fullName,
            email: session.metadata?.email,
            phone: session.metadata?.phone,
            pickup_location: session.metadata?.pickup,
            dropoff_location: session.metadata?.dropoff,
            additional_requests: session.metadata?.additionalRequests,
            date_time: session.metadata?.dateTime,
            selected_car: session.metadata?.selectedCar,
            is_paid: true,
        };

        console.log("🔔 Stripe session:", session);
        console.log("📦 Booking object:", booking);
        console.log("🔔 Stripe session:", session);
        console.log("📦 Booking object:", booking);

        // Insert into bookings table
        const { error: bookingError } = await supabase.from("bookings").insert([booking]);


        if (bookingError) {
            console.error("Failed to insert booking:", bookingError.message);
            return new NextResponse("Supabase insert failed", { status: 500 });
        }

        console.log("✅ Booking recorded:", booking);
        console.log("🔔 Stripe session:", session);


        // Fetch vehicle_id based on selected_car
        const { data: vehicle, error: vehicleError } = await supabase
            .from("vehicles")
            .select("id")
            .eq("name", booking.selected_car)
            .single();

        if (vehicleError || !vehicle) {
            console.error("Vehicle not found:", vehicleError?.message);
            return new NextResponse("Vehicle not found", { status: 500 });
        }

        // Insert into vehicle_availability
        const availability = {
            vehicle_id: vehicle.id,
            start_time: booking.date_time, // assuming start_time is same as date_time
            end_time: booking.date_time,   // adjust if necessary
        };

        const { error: availabilityError } = await supabase
            .from("vehicle_availability")
            .insert([availability]);

        if (availabilityError) {
            console.error("Failed to insert vehicle availability:", availabilityError.message);
            return new NextResponse("Availability insert failed", { status: 500 });
        }

        console.log("✅ Vehicle availability recorded:", availability);
    }

    return new NextResponse("OK", { status: 200 });
}
