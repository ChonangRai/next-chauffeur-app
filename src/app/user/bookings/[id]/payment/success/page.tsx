"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const updateBookingStatus = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        toast.error("Invalid payment session");
        router.push("/user/dashboard");
        return;
      }

      try {
        // Update booking payment status
        await updateDoc(doc(db, "bookings", params.id), {
          payment_status: "Paid",
          updated_at: new Date().toISOString(),
        });

        toast.success("Payment successful!");
      } catch (error) {
        console.error("Error updating booking:", error);
        toast.error("Failed to update booking status");
      } finally {
        setIsProcessing(false);
      }
    };

    updateBookingStatus();
  }, [params.id, router, searchParams]);

  if (isProcessing) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <p>Processing payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-gray-600">
              Your payment has been processed successfully. Thank you for your booking!
            </p>
            <div className="flex justify-end">
              <Button onClick={() => router.push("/user/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 