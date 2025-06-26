import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Webhook test endpoint",
    timestamp: new Date().toISOString(),
    env: {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    }
  });
} 