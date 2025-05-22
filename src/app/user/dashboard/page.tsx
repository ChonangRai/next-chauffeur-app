"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Booking } from "@/types/admin";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { format, isAfter, subHours } from "date-fns";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/user/signin");
        return;
      }

      try {
        const bookingsRef = collection(db, "bookings");
        const q = query(
          bookingsRef,
          where("email", "==", user.email),
          orderBy("date_time", "desc")
        );

        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];

        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (err) {
      setError("Failed to cancel booking. Please try again.");
    }
  };

  const canModifyBooking = (bookingDate: string) => {
    const serviceDateTime = new Date(bookingDate);
    const now = new Date();
    const twentyFourHoursBefore = subHours(serviceDateTime, 24);
    return isAfter(now, twentyFourHoursBefore);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const currentBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date_time);
    const isFutureBooking = bookingDate > new Date();
    const isPendingPayment = booking.payment_status !== "Paid";
    const isExpired = !canModifyBooking(booking.date_time);
    
    if (isExpired && isPendingPayment) {
      return false;
    }
    
    return isFutureBooking;
  });
  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date_time);
    const isPastBooking = bookingDate <= new Date();
    const isExpired = !canModifyBooking(booking.date_time);
    const isPendingPayment = booking.payment_status !== "Paid";
    
    return isPastBooking || (isExpired && isPendingPayment);
  });

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {currentBookings.length === 0 ? (
              <p>No current bookings.</p>
            ) : (
              <div className="grid gap-4">
                {currentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-6 bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Booking Details
                        </h3>
                        <p className="text-sm text-gray-600">
                          Booking Reference: {booking.booking_ref}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(booking.date_time).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Service Type: {booking.service_type}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {booking.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Amount: £{booking.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Payment Status: {booking.payment_status || "Unpaid"}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Location Details
                        </h3>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Pickup:</span>{" "}
                            {booking.pickup_location}
                          </p>
                          {booking.dropoff_location && (
                            <p>
                              <span className="font-medium">Dropoff:</span>{" "}
                              {booking.dropoff_location}
                            </p>
                          )}
                          {booking.service_subtype === "arrival" &&
                            booking.arrival_flight && (
                              <p>
                                <span className="font-medium">
                                  Arrival Flight:
                                </span>{" "}
                                {booking.arrival_flight}
                              </p>
                            )}
                          {booking.service_subtype === "departure" &&
                            booking.departure_flight && (
                              <p>
                                <span className="font-medium">
                                  Departure Flight:
                                </span>{" "}
                                {booking.departure_flight}
                              </p>
                            )}
                          {booking.service_subtype === "connection" && (
                            <>
                              {booking.arrival_flight && (
                                <p>
                                  <span className="font-medium">
                                    Arrival Flight:
                                  </span>{" "}
                                  {booking.arrival_flight}
                                </p>
                              )}
                              {booking.departure_flight && (
                                <p>
                                  <span className="font-medium">
                                    Departure Flight:
                                  </span>{" "}
                                  {booking.departure_flight}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {canModifyBooking(booking.date_time) && (
                        <>
                          <Button
                            variant="outline"
                            onClick={() =>
                              router.push(`/user/bookings/${booking.id}/edit`)
                            }
                          >
                            Edit Booking
                          </Button>
                          {booking.payment_status !== "Paid" && (
                            <Button
                              variant="default"
                              onClick={() =>
                                router.push(
                                  `/user/bookings/${booking.id}/payment`
                                )
                              }
                            >
                              Make Payment
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings.length === 0 ? (
              <p>No past bookings.</p>
            ) : (
              <div className="grid gap-4">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-6 bg-white"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Booking Details
                        </h3>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Date & Time:</span>{" "}
                            {format(new Date(booking.date_time), "PPP p")}
                          </p>
                          <p>
                            <span className="font-medium">Service Type:</span>{" "}
                            {booking.service_type}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            <span className="capitalize">{booking.status}</span>
                          </p>
                          <p>
                            <span className="font-medium">Passengers:</span>{" "}
                            {booking.passengers}
                          </p>
                          <p>
                            <span className="font-medium">Luggage:</span>{" "}
                            {booking.luggage}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Location Details
                        </h3>
                        <div className="space-y-2">
                          <p>
                            <span className="font-medium">Pickup:</span>{" "}
                            {booking.pickup_location}
                          </p>
                          {booking.dropoff_location && (
                            <p>
                              <span className="font-medium">Dropoff:</span>{" "}
                              {booking.dropoff_location}
                            </p>
                          )}
                          {booking.service_subtype === "arrival" &&
                            booking.arrival_flight && (
                              <p>
                                <span className="font-medium">
                                  Arrival Flight:
                                </span>{" "}
                                {booking.arrival_flight}
                              </p>
                            )}
                          {booking.service_subtype === "departure" &&
                            booking.departure_flight && (
                              <p>
                                <span className="font-medium">
                                  Departure Flight:
                                </span>{" "}
                                {booking.departure_flight}
                              </p>
                            )}
                          {booking.service_subtype === "connection" && (
                            <>
                              {booking.arrival_flight && (
                                <p>
                                  <span className="font-medium">
                                    Arrival Flight:
                                  </span>{" "}
                                  {booking.arrival_flight}
                                </p>
                              )}
                              {booking.departure_flight && (
                                <p>
                                  <span className="font-medium">
                                    Departure Flight:
                                  </span>{" "}
                                  {booking.departure_flight}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
