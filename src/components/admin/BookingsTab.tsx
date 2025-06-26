"use client";

// import { useState } from "react"; // No longer needed
import { Booking, Driver } from "@/types";
import BookingRow from "./BookingRow";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

type BookingsTabProps = {
  bookings: Booking[];
  drivers: Driver[];
  isLoadingBookings: boolean;
  bookingError: string | null;
  fetchBookings: () => Promise<void>;
};

export default function BookingsTab({
  bookings,
  drivers,
  isLoadingBookings,
  bookingError,
  fetchBookings,
}: BookingsTabProps) {
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updated_at: new Date(),
      });

      // If status is changed to 'confirmed', send booking confirmation email via API
      if (newStatus === "confirmed") {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          try {
            const response = await fetch("/api/send-booking-confirmation", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ bookingId }),
            });

            if (response.ok) {
              toast.success("Booking confirmed and confirmation email sent");
            } else {
              toast.error("Booking confirmed but failed to send email");
            }
          } catch (emailError) {
            console.error("Failed to send booking confirmation email:", emailError);
            toast.error("Booking confirmed but failed to send email");
          }
        }
      } else {
        toast.success("Booking status updated successfully");
      }

      await fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const handleAssignStaff = async (bookingId: string, staffId: string) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      const updateData: any = {
        staff_id: staffId === "unassign" ? null : staffId,
        updated_at: new Date(),
      };

      if (staffId !== "unassign") {
        updateData.staff_assigned = true;
      } else {
        updateData.staff_assigned = false;
      }

      await updateDoc(bookingRef, updateData);
      toast.success("Staff assigned successfully");
      await fetchBookings();
    } catch (error) {
      console.error("Error assigning staff:", error);
      toast.error("Failed to assign staff");
    }
  };

  const handleMarkBookingCompleted = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "completed",
        updated_at: new Date(),
      });

      // Send booking confirmation email when marked as completed via API
      try {
        const response = await fetch("/api/send-booking-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId }),
        });

        if (response.ok) {
          toast.success("Booking completed and confirmation email sent");
        } else {
          toast.error("Booking completed but failed to send email");
        }
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
        toast.error("Booking completed but failed to send email");
      }

      await fetchBookings();
    } catch (error) {
      console.error("Error marking booking completed:", error);
      toast.error("Failed to mark booking as completed");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        status: "deleted",
        updated_at: new Date(),
      });
      toast.success("Booking deleted successfully");
      await fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  if (isLoadingBookings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading bookings: {bookingError}</p>
      </div>
    );
  }

  const activeBookings = bookings.filter(booking => booking.status !== "deleted");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
        <div className="text-sm text-gray-600">
          Total: {activeBookings.length} bookings
        </div>
      </div>

      {activeBookings.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Ref
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pickup
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activeBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  drivers={drivers}
                  handleUpdateBookingStatus={handleUpdateBookingStatus}
                  handleAssignStaff={handleAssignStaff}
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