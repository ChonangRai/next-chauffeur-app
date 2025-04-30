"use client";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { DriverPayment, Driver } from "@/types/admin";

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
  // Handle paying a driver
  const handlePayDriver = async (paymentId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from("driver_payments")
        .update({ status: "paid", payment_date: new Date().toISOString() })
        .eq("id", paymentId);
      if (error) throw new Error(error.message);
      fetchDriverPayments();
      alert("Driver payment marked as paid.");
    } catch (err) {
      console.error("Error paying driver:", err);
      alert("Failed to mark payment as paid. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Driver Payments</h2>

      {isLoadingPayments ? (
        <p className="text-center">Loading payments...</p>
      ) : paymentError ? (
        <p className="text-red-500 text-center">{paymentError}</p>
      ) : driverPayments.length === 0 ? (
        <p className="text-center">No driver payments found.</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-left">Driver</th>
                <th className="p-2 text-left">Booking ID</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Payment Date</th>
                <th className="p-2 text-left">Method</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {driverPayments.map((payment) => {
                const driver = drivers.find((d) => d.id === payment.driver_id);
                return (
                  <tr key={payment.id} className="border-b">
                    <td className="p-2">{payment.id.slice(0, 8)}...</td>
                    <td className="p-2">{new Date(payment.created_at).toLocaleString()}</td>
                    <td className="p-2">{driver?.full_name || "N/A"}</td>
                    <td className="p-2">{payment.booking_id.slice(0, 8)}...</td>
                    <td className="p-2">£{payment.amount.toFixed(2)}</td>
                    <td className="p-2">{payment.status}</td>
                    <td className="p-2">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="p-2">{payment.payment_method}</td>
                    <td className="p-2">
                      {payment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePayDriver(payment.id)}
                        >
                          Mark as Paid
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