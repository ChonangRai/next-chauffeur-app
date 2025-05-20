"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function EditBookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const bookingDoc = await getDoc(doc(db, "bookings", params.id));
        if (bookingDoc.exists()) {
          setBooking(bookingDoc.data() as Booking);
        } else {
          toast.error("Booking not found");
          router.push("/user/dashboard");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast.error("Failed to fetch booking details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [params.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    try {
      await updateDoc(doc(db, "bookings", params.id), {
        ...booking,
        updated_at: new Date().toISOString(),
      });
      toast.success("Booking updated successfully");
      router.push("/user/dashboard");
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Failed to update booking");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!booking) return <div>Booking not found</div>;

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={booking.full_name}
                  onChange={(e) =>
                    setBooking({ ...booking, full_name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={booking.email}
                  onChange={(e) =>
                    setBooking({ ...booking, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={booking.phone || ""}
                  onChange={(e) =>
                    setBooking({ ...booking, phone: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_location">Pickup Location</Label>
                <Input
                  id="pickup_location"
                  value={booking.pickup_location}
                  onChange={(e) =>
                    setBooking({ ...booking, pickup_location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dropoff_location">Dropoff Location</Label>
                <Input
                  id="dropoff_location"
                  value={booking.dropoff_location || ""}
                  onChange={(e) =>
                    setBooking({ ...booking, dropoff_location: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/user/dashboard")}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 