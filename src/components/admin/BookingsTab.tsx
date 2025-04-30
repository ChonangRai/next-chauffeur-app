"use client";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type Booking = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  pickup_location: string;
  dropoff_location: string | null;
  date_time: string;
  selected_car: string;
  amount: number;
  status: string;
  is_hire_by_hour: boolean;
  duration: number | null;
  duration_unit: string | null;
  driver_id: string | null;
  driver_status: string;
};

type Driver = {
  id: string;
  full_name: string;
};

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
  // Handle updating booking status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabaseAdmin.from("bookings").update({ status: newStatus }).eq("id", bookingId);
      if (error) throw new Error(error.message);
      fetchBookings();
      alert(`Booking status updated to ${newStatus}`);
    } catch (err) {
      console.error("Error updating booking status:", err);
      alert("Failed to update booking status. Please try again.");
    }
  };

  // Handle assigning a driver to a booking
  const handleAssignDriver = async (bookingId: string, driverId: string | null) => {
    try {
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ driver_id: driverId, driver_status: driverId ? "assigned" : "unassigned" })
        .eq("id", bookingId);
      if (error) throw new Error(error.message);
      fetchBookings();
      alert(driverId ? "Driver assigned successfully" : "Driver unassigned successfully");
    } catch (err) {
      console.error("Error assigning driver:", err);
      alert("Failed to assign driver. Please try again.");
    }
  };

  // Handle marking a booking as completed by the driver
  const handleMarkBookingCompleted = async (bookingId: string) => {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking?.driver_id) {
        alert("No driver assigned to this booking.");
        return;
      }

      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ driver_status: "completed" })
        .eq("id", bookingId);
      if (error) throw new Error(error.message);

      // Create a driver payment record (e.g., 70% of booking amount)
      const amount = booking.amount * 0.7; // Example: driver gets 70%
      const { error: paymentError } = await supabaseAdmin.from("driver_payments").insert({
        driver_id: booking.driver_id,
        booking_id: bookingId,
        amount,
        status: "pending",
        payment_method: "Bank Transfer", // Default method
      });
      if (paymentError) throw new Error(paymentError.message);

      fetchBookings();
      fetchDriverPayments();
      alert("Booking marked as completed. Driver payment record created.");
    } catch (err) {
      console.error("Error marking booking as completed:", err);
      alert("Failed to mark booking as completed. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

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
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Pickup</th>
                <th className="p-2 text-left">Dropoff</th>
                <th className="p-2 text-left">Date/Time</th>
                <th className="p-2 text-left">Car</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Hire By Hour</th>
                <th className="p-2 text-left">Duration</th>
                <th className="p-2 text-left">Driver</th>
                <th className="p-2 text-left">Driver Status</th>
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
                  <td className="p-2">{booking.phone || "N/A"}</td>
                  <td className="p-2">{booking.pickup_location}</td>
                  <td className="p-2">{booking.dropoff_location || "N/A"}</td>
                  <td className="p-2">{new Date(booking.date_time).toLocaleString()}</td>
                  <td className="p-2">{booking.selected_car}</td>
                  <td className="p-2">£{booking.amount.toFixed(2)}</td>
                  <td className="p-2">
                    <Select
                      value={booking.status}
                      onValueChange={(value) => handleUpdateBookingStatus(booking.id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">{booking.is_hire_by_hour ? "Yes" : "No"}</td>
                  <td className="p-2">
                    {booking.is_hire_by_hour
                      ? `${booking.duration} ${booking.duration_unit}`
                      : "N/A"}
                  </td>
                  <td className="p-2">
                    <Select
                      value={booking.driver_id || ""}
                      onValueChange={(value) =>
                        handleAssignDriver(booking.id, value || null)
                      }
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Assign Driver" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassign</SelectItem>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">{booking.driver_status}</td>
                  <td className="p-2">
                    {booking.driver_status === "assigned" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkBookingCompleted(booking.id)}
                      >
                        Mark Completed
                      </Button>
                    )}
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