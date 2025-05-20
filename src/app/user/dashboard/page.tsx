"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Booking } from "@/types/admin";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserBookings = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/user/signin");
        return;
      }

      console.log("Current user:", {
        uid: user.uid,
        email: user.email
      });

      try {
        const bookingsRef = collection(db, "bookings");
        
        // Query by email only for now
        const q = query(
          bookingsRef,
          where("email", "==", user.email),
          orderBy("date_time", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Bookings found:", querySnapshot.docs.map(doc => ({
          id: doc.id,
          email: doc.data().email,
          user_id: doc.data().user_id
        })));

        const bookingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        
        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        if (err instanceof Error && err.message.includes("index")) {
          setError("Please wait while we set up the database. This may take a few minutes.");
        } else {
          setError("Failed to fetch bookings. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserBookings();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/user/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const currentBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date_time);
    return bookingDate > new Date();
  });
  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date_time);
    return bookingDate <= new Date();
  });

  return (
    <div className="min-h-screen bg-muted p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Customer Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push("/user/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
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
              <ul className="space-y-4">
                {currentBookings.map((booking) => (
                  <li key={booking.id} className="border p-4 rounded">
                    <p>Date & Time: {new Date(booking.date_time).toLocaleString()}</p>
                    <p>Service: {booking.service_type}</p>
                    <p>Pickup: {booking.pickup_location}</p>
                    <p>Dropoff: {booking.dropoff_location}</p>
                    <p>Passengers: {booking.passengers}</p>
                  </li>
                ))}
              </ul>
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
              <ul className="space-y-4">
                {pastBookings.map((booking) => (
                  <li key={booking.id} className="border p-4 rounded">
                    <p>Date & Time: {new Date(booking.date_time).toLocaleString()}</p>
                    <p>Service: {booking.service_type}</p>
                    <p>Pickup: {booking.pickup_location}</p>
                    <p>Dropoff: {booking.dropoff_location}</p>
                    <p>Passengers: {booking.passengers}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}