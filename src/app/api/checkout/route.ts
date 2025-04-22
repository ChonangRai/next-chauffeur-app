import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { bookingDetails, amount } = await req.json();

    console.log("Request body:", { bookingDetails, amount });

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

    const stripeParams: Stripe.Checkout.SessionCreateParams = {
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
        selectedCar: String(bookingDetails.selectedCar),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
    };

    console.log("Stripe params:", stripeParams);

    const session = await stripe.checkout.sessions.create(stripeParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}