"use client";
import { useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import Notification from "@/components/ui/notification";
import BookingRow from "./BookingRow";
import { Booking, Driver, DriverStatus } from "@/types/admin";

type BookingsTabProps = {
  bookings: Booking[];
  isLoadingBookings: boolean;
  bookingError: string | null;
  drivers: Driver[];
  fetchBookings: () => Promise<void>;
  fetchDriverPayments: () => Promise<void>;
};

export default function BookingsTab({
  bookings,
  isLoadingBookings,
  bookingError,
  drivers,
  fetchBookings,
  fetchDriverPayments,
}: BookingsTabProps) {
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Show notification
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle updating booking status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin.from("bookings").update({ status: newStatus }).eq("id", bookingId);
      if (error) throw new Error(error.message);
      await fetchBookings();
      showNotification("success", `Booking status updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Error updating booking status:", err);
      showNotification("error", `Failed to update booking status: ${err.message || "Unknown error"}`);
    }
  };

  // Handle assigning a driver to a booking
  const handleAssignDriver = async (bookingId: string, value: string) => {
    try {
      const driverId = value === "unassign" ? null : value;
      const driverStatus: DriverStatus = driverId ? "assigned" : "unassigned";
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ driver_id: driverId, driver_status: driverStatus })
        .eq("id", bookingId);
      if (error) throw new Error(error.message);
      await fetchBookings();
      showNotification("success", driverId ? "Driver assigned successfully" : "Driver unassigned successfully");
    } catch (err: any) {
      console.error("Error assigning driver:", err);
      showNotification("error", `Failed to assign driver: ${err.message || "Unknown error"}`);
    }
  };

  // Handle marking a booking as completed by the driver
  const handleMarkBookingCompleted = async (bookingId: string) => {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking?.driver_id) {
        showNotification("error", "No driver assigned to this booking.");
        return;
      }

      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ driver_status: "completed" })
        .eq("id", bookingId);
      if (error) throw new Error(error.message);

      const amount = booking.amount * 0.7;
      const { error: paymentError } = await supabaseAdmin.from("driver_payments").insert({
        driver_id: booking.driver_id,
        booking_id: bookingId,
        amount,
        status: "pending",
        payment_method: "Bank Transfer",
      });
      if (paymentError) throw new Error(paymentError.message);

      await fetchBookings();
      await fetchDriverPayments();
      showNotification("success", "Booking marked as completed. Driver payment record created.");
    } catch (err: any) {
      console.error("Error marking booking as completed:", err);
      showNotification("error", `Failed to mark booking as completed: ${err.message || "Unknown error"}`);
    }
  };

  // Handle deleting a booking
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabaseAdmin
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      if (error) throw new Error(error.message);

      await fetchBookings();
      showNotification("success", "Booking deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting booking:", err);
      showNotification("error", `Failed to delete booking: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Manage Bookings</h2>

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      {isLoadingBookings ? (
        <p className="text-center text-gray-600">Loading bookings...</p>
      ) : bookingError ? (
        <p className="text-red-500 text-center">{bookingError}</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings found.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left font-semibold">Booking Ref</th>
                <th className="p-4 text-left font-semibold">Booking Date and Time</th>
                <th className="p-4 text-left font-semibold">Full Name</th>
                <th className="p-4 text-left font-semibold">Pickup</th>
                <th className="p-4 text-left font-semibold">Amount</th>
                <th className="p-4 text-left font-semibold">Booking Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  drivers={drivers}
                  handleUpdateBookingStatus={handleUpdateBookingStatus}
                  handleAssignDriver={handleAssignDriver}
                  handleMarkBookingCompleted={handleMarkBookingCompleted}
                  handleDeleteBooking={handleDeleteBooking}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}