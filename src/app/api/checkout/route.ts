import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY! )

export async function POST(req: Request) {
  try {
    const { bookingDetails, amount } = await req.json();

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      throw new Error("NEXT_PUBLIC_BASE_URL is not defined");
    }

    // Validate request data
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
      !bookingDetails.selectedCar ||
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

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${bookingDetails.selectedCar} - ${
                bookingDetails.isHireByHour ? "By Hour" : "One Way"
              }`,
            },
            unit_amount: Math.round(amount * 100), // Ensure integer
          },
          quantity: 1,
        },
      ],
      metadata: {
        fullName: bookingDetails.fullName,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        pickup: bookingDetails.pickupLocation,
        dropoff: bookingDetails.dropoffLocation || "N/A",
        additionalRequests: bookingDetails.additionalRequests || "None",
        dateTime: bookingDetails.dateTime,
        selectedCar: bookingDetails.selectedCar,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}