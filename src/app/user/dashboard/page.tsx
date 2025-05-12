"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Booking } from "@/types/admin";
import { supabase } from "@/lib/supabase";

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/user/signin");
        return;
      }

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", user.id)
        .order("date_time", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setBookings(data as Booking[]);
      }
      setIsLoading(false);
    };
    fetchUserBookings();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/user/signin");
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
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
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