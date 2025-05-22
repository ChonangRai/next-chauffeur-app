import Stripe from "stripe";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function formatServiceType(serviceType: string): string {
  switch (serviceType) {
    case "meetAndGreet":
      return "Meet and Greet";
    case "airportTransfer":
      return "Airport Transfer";
    case "hourlyHire":
      return "Hourly Hire";
    default:
      return serviceType;
  }
}

export async function POST(req: Request) {
  try {
    const { bookingDetails, amount } = await req.json();

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Validate request body
    if (!bookingDetails?.fullName || !bookingDetails?.email || !bookingDetails?.pickupLocation || !bookingDetails?.dateTime || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid booking details" },
        { status: 400 }
      );
    }

    try {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `${formatServiceType(bookingDetails.service_type || bookingDetails.serviceType)} - ${
                  (bookingDetails.service_type === "hourlyHire" || bookingDetails.serviceType === "hourlyHire") ? "By the Hour" : bookingDetails.service_subtype
                }`,
                description: `Booking for ${bookingDetails.fullName}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          fullName: String(bookingDetails.fullName),
          email: String(bookingDetails.email),
          phone: String(bookingDetails.phone || "N/A"),
          pickup: String(bookingDetails.pickupLocation),
          dropoff: String(bookingDetails.dropoffLocation || "N/A"),
          additionalRequests: String(bookingDetails.additionalRequests || "None"),
          dateTime: String(bookingDetails.dateTime),
          serviceType: String(bookingDetails.serviceType),
          meetAndGreetType: String(bookingDetails.meetAndGreetType || "N/A"),
          isHourlyHire: String(bookingDetails.serviceType === "hourlyHire"),
          duration: bookingDetails.serviceType === "hourlyHire" ? String(bookingDetails.duration) : null,
          durationUnit: bookingDetails.serviceType === "hourlyHire" ? String(bookingDetails.durationUnit) : null,
          flightNumberArrival: String(bookingDetails.flightNumberArrival || "N/A"),
          flightNumberDeparture: String(bookingDetails.flightNumberDeparture || "N/A"),
        },
        customer_email: bookingDetails.email,
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
        custom_text: {
          submit: {
            message: `Booking Summary:
Service: ${bookingDetails.serviceType}
Date: ${new Date(bookingDetails.dateTime).toLocaleDateString()}
Time: ${new Date(bookingDetails.dateTime).toLocaleTimeString()}
Pickup: ${bookingDetails.pickupLocation}
${bookingDetails.dropoffLocation ? `Dropoff: ${bookingDetails.dropoffLocation}` : ''}
Passengers: ${bookingDetails.passengers}
${bookingDetails.bags > 0 ? `Bags: ${bookingDetails.bags}` : ''}
${bookingDetails.wantBuggy ? 'Buggy Service: Yes' : ''}
${bookingDetails.wantPorter ? 'Porter Service: Yes' : ''}
${bookingDetails.flightNumberArrival ? `Arrival Flight: ${bookingDetails.flightNumberArrival}` : ''}
${bookingDetails.flightNumberDeparture ? `Departure Flight: ${bookingDetails.flightNumberDeparture}` : ''}`,
          },
        },
      });

      // Generate booking_ref
      const booking_ref = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);

      // Get current user if logged in
      const user = auth.currentUser;

      // Save booking to Firebase
      const bookingData = {
        full_name: bookingDetails.fullName,
        email: bookingDetails.email,
        phone: bookingDetails.phone || null,
        pickup_location: bookingDetails.pickupLocation,
        dropoff_location: bookingDetails.dropoffLocation || null,
        additional_requests: bookingDetails.additionalRequests || null,
        date_time: bookingDetails.dateTime,
        service_type: bookingDetails.service_type || bookingDetails.serviceType,
        service_subtype: bookingDetails.service_subtype || bookingDetails.serviceSubtype || null,
        amount: amount,
        status: "pending",
        payment_status: "pending",
        contact_consent: bookingDetails.contactConsent || false,
        duration: (bookingDetails.service_type === "hourlyHire" || bookingDetails.serviceType === "hourlyHire") ? bookingDetails.duration : null,
        duration_unit: (bookingDetails.service_type === "hourlyHire" || bookingDetails.serviceType === "hourlyHire") ? bookingDetails.durationUnit : null,
        driver_status: "unassigned",
        booking_ref,
        flight_number_arrival: bookingDetails.flightNumberArrival || null,
        flight_number_departure: bookingDetails.flightNumberDeparture || null,
        passengers: bookingDetails.passengers || 1,
        bags: bookingDetails.bags || 0,
        want_buggy: bookingDetails.wantBuggy || false,
        want_porter: bookingDetails.wantPorter || false,
        created_at: serverTimestamp(),
        stripe_session_id: session.id,
        user_id: user?.uid || null,
      };

      const bookingsRef = collection(db, "bookings");
      await addDoc(bookingsRef, bookingData);

      return NextResponse.json({ url: session.url });
    } catch (err) {
      const error = err as Error;
      return NextResponse.json(
        { error: error.message || "Failed to process booking" },
        { status: 500 }
      );
    }
  } catch (err) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}