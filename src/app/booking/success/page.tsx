"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessPageContent() {
  const [isUpdating, setIsUpdating] = useState(false);
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Try to update payment status as a fallback
      const updatePaymentStatus = async () => {
        setIsUpdating(true);
        try {
          const response = await fetch('/api/update-payment-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });
          
          if (response.ok) {
            console.log('Payment status updated successfully');
          } else {
            console.log('Payment status update failed, webhook should handle it');
          }
        } catch (error) {
          console.error('Error updating payment status:', error);
        } finally {
          setIsUpdating(false);
        }
      };

      updatePaymentStatus();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: `url('/images/special-events.jpg')`,
          filter: "blur(6px) grayscale(100%) brightness(0.4)",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-xl">
        <div className="animate-fade-in">
          <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold mb-4">
            Payment Confirmed.
          </h1>
          <p className="text-lg mb-8">
            Thank you for booking with <span className="text-gray-300 font-medium">London Chauffeur Hire</span>. 
            Your booking is confirmed and a confirmation email has been sent to you. 
            Sit back, relax, and let luxury drive you.
          </p>
          {isUpdating && (
            <p className="text-sm text-gray-400 mb-4">
              Finalizing your booking...
            </p>
          )}
          <Link
            href="/"
            className="inline-block bg-white text-black font-semibold py-3 px-6 rounded-2xl shadow-lg hover:bg-gray-200 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-6"></div>
          <div className="h-8 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-8"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
