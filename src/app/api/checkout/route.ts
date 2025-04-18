import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { bookingDetails, amount } = await req.json();


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
            unit_amount: amount * 100,
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
    return NextResponse.json({ error: (error as any).message || "Unknown error" }, { status: 500 });
  }
}
