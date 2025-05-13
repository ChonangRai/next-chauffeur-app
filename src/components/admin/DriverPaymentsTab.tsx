"use client";
import { useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DriverPayment, Driver } from "@/types/admin";
import Notification from "@/components/ui/notification";

type DriverPaymentsTabProps = {
  driverPayments: DriverPayment[];
  isLoadingPayments: boolean;
  paymentError: string | null;
  drivers: Driver[];
  fetchDriverPayments: () => Promise<void>;
};

export default function DriverPaymentsTab({
  driverPayments,
  isLoadingPayments,
  paymentError,
  drivers,
  fetchDriverPayments,
}: DriverPaymentsTabProps) {
  const [notification, setNotification] = useState<{ 
    type: "success" | "error"; 
    message: string 
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle paying a driver
  const handlePayDriver = async (paymentId: string) => {
    if (!supabaseAdmin) {
      showNotification("error", "Server configuration error: Admin access not available");
      return;
    }

    try {
      const { error } = await supabaseAdmin
        .from("driver_payments")
        .update({ 
          status: "paid", 
          payment_date: new Date().toISOString() 
        })
        .eq("id", paymentId);

      if (error) throw error;

      await fetchDriverPayments();
      showNotification("success", "Payment marked as paid successfully");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process payment";
      console.error("Payment error:", errorMessage);
      showNotification("error", errorMessage);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Driver Payments</h2>

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {isLoadingPayments ? (
        <p className="text-center text-gray-600">Loading payments...</p>
      ) : paymentError ? (
        <p className="text-red-500 text-center">{paymentError}</p>
      ) : driverPayments.length === 0 ? (
        <p className="text-center text-gray-600">No driver payments found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Payment ID</th>
                <th className="p-4 text-left font-semibold">Created</th>
                <th className="p-4 text-left font-semibold">Driver</th>
                <th className="p-4 text-left font-semibold">Booking</th>
                <th className="p-4 text-left font-semibold">Amount</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Paid On</th>
                <th className="p-4 text-left font-semibold">Method</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {driverPayments.map((payment) => {
                const driver = drivers.find((d) => d.id === payment.driver_id);
                return (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{payment.id.slice(0, 8)}...</td>
                    <td className="p-4">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {driver?.full_name || "Unknown Driver"}
                    </td>
                    <td className="p-4">{payment.booking_id.slice(0, 8)}...</td>
                    <td className="p-4">£{payment.amount.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.status === "paid" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">{payment.payment_method}</td>
                    <td className="p-4">
                      {payment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePayDriver(payment.id)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}