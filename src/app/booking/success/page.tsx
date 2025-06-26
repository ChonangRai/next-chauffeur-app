"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl"
      >
        <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">
          Payment Confirmed.
        </h1>
        <p className="text-lg mb-8">
          Thank you for booking with <span className="text-gray-300 font-medium">London Chauffeur Hire</span>. 
          Your ride is confirmed and a confirmation email has been sent to you. 
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/special-events.jpg.jpg')`,
          zIndex: -1,
          filter: "blur(6px) grayscale(100%) brightness(0.4)",
        }}
      />
    </div>
  );
}
