"use client";
import { useState } from "react";
import { supabaseAdmin } from "../../lib/supabase";
import Notification from "../../components/ui/notification";
import BookingRow from "./BookingRow";
import { Booking, Driver, DriverStatus } from "../../types/admin";

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

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleDatabaseOperation = async (operation: () => Promise<void>, successMessage: string) => {
    if (!supabaseAdmin) {
      showNotification("error", "Server configuration error: Admin access not available");
      return;
    }

    try {
      await operation();
      showNotification("success", successMessage);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      console.error("Operation failed:", message);
      showNotification("error", `Operation failed: ${message}`);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    await handleDatabaseOperation(async () => {
      const { error } = await supabaseAdmin!
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", bookingId);
      if (error) throw error;
      await fetchBookings();
    }, `Booking status updated to ${newStatus}`);
  };

  const handleAssignDriver = async (bookingId: string, value: string) => {
    await handleDatabaseOperation(async () => {
      const driverId = value === "unassign" ? null : value;
      const driverStatus: DriverStatus = driverId ? "assigned" : "unassigned";
      const { error } = await supabaseAdmin!
        .from("bookings")
        .update({ driver_id: driverId, driver_status: driverStatus })
        .eq("id", bookingId);
      if (error) throw error;
      await fetchBookings();
    }, value === "unassign" ? "Driver unassigned successfully" : "Driver assigned successfully");
  };

  const handleMarkBookingCompleted = async (bookingId: string) => {
    await handleDatabaseOperation(async () => {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking?.driver_id) {
        throw new Error("No driver assigned to this booking");
      }

      const { error } = await supabaseAdmin!
        .from("bookings")
        .update({ driver_status: "completed" })
        .eq("id", bookingId);
      if (error) throw error;

      const amount = booking.amount * 0.7;
      const { error: paymentError } = await supabaseAdmin!
        .from("driver_payments")
        .insert({
          driver_id: booking.driver_id,
          booking_id: bookingId,
          amount,
          status: "pending",
          payment_method: "Bank Transfer",
        });
      if (paymentError) throw paymentError;

      await Promise.all([fetchBookings(), fetchDriverPayments()]);
    }, "Booking marked as completed. Driver payment record created.");
  };

  const handleDeleteBooking = async (bookingId: string) => {
    await handleDatabaseOperation(async () => {
      const { error } = await supabaseAdmin!
        .from("bookings")
        .delete()
        .eq("id", bookingId);
      if (error) throw error;
      await fetchBookings();
    }, "Booking deleted successfully!");
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