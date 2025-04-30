"use client";
import { Button } from "@/components/ui/button";
import { Booking } from "@/types/admin";

type InvoicesTabProps = {
  bookings: Booking[];
  isLoadingBookings: boolean;
  bookingError: string | null;
};

export default function InvoicesTab({ bookings, isLoadingBookings, bookingError }: InvoicesTabProps) {
  // Handle generating an invoice
  const handleGenerateInvoice = async (booking: Booking) => {
    try {
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate invoice");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${booking.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Generate Invoices</h2>

      {isLoadingBookings ? (
        <p className="text-center">Loading bookings...</p>
      ) : bookingError ? (
        <p className="text-red-500 text-center">{bookingError}</p>
      ) : bookings.length === 0 ? (
        <p className="text-center">No bookings found.</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Created At</th>
                <th className="p-2 text-left">Full Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b">
                  <td className="p-2">{booking.id.slice(0, 8)}...</td>
                  <td className="p-2">{new Date(booking.created_at).toLocaleString()}</td>
                  <td className="p-2">{booking.full_name}</td>
                  <td className="p-2">{booking.email}</td>
                  <td className="p-2">£{booking.amount.toFixed(2)}</td>
                  <td className="p-2">{booking.status}</td>
                  <td className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateInvoice(booking)}
                    >
                      Generate Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}