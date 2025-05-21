"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getLocations } from "@/lib/firebase-admin";
import type { Location } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Icons } from "@/components/ui/icons";

type BookingDetails = {
  pickupLocationId: string | null;
  dropoffLocationId: string | null;
  date: Date | undefined;
  hour: string;
  minute: string;
  period: string;
  fullName: string;
  email: string;
  phone: string;
  additionalRequests: string;
  passengers: number;
  additionalHours: number;
  bags: number;
  wantBuggy: boolean;
  wantPorter: boolean;
  contactConsent: boolean;
  service_type: "meetAndGreet" | "airportTransfer" | "hourlyHire";
  service_subtype: "arrival" | "departure" | "connection" | null;
  calculatedAmount: number | null;
  flightNumberArrival: string;
  flightNumberDeparture: string;
  airportTransferType?: "one_way" | "round_trip";
  hireDuration?: "full_day" | "half_day";
};

function BookingContent() {
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickupLocationId: null,
    dropoffLocationId: null,
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    hour: "14",
    minute: "00",
    period: "pm",
    fullName: "",
    email: "",
    phone: "",
    additionalRequests: "",
    passengers: 1,
    additionalHours: 0,
    bags: 0,
    wantBuggy: false,
    wantPorter: false,
    contactConsent: false,
    service_type: "meetAndGreet",
    service_subtype: null,
    calculatedAmount: null,
    flightNumberArrival: "",
    flightNumberDeparture: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setLocationsError("Failed to load locations. Please try again.");
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();

    // Check for service details in localStorage
    const serviceDetails = localStorage.getItem('serviceDetails');
    if (serviceDetails) {
      const details = JSON.parse(serviceDetails);
      setBookingDetails((prev) => ({
        ...prev,
        service_type: details.service_type,
        pickupLocationId: details.locationId,
        date: details.date ? new Date(details.date) : undefined,
        hour: details.hour,
        minute: details.minute,
        passengers: details.passengers,
        additionalHours: details.additionalHours,
        bags: details.additionalServices.bags || 0,
        wantBuggy: details.additionalServices.buggy || false,
        wantPorter: details.additionalServices.porter || false,
        calculatedAmount: details.estimatedPrice,
        service_subtype: details.service_subtype,
        flightNumberArrival: details.flightDetails?.arrival || "",
        flightNumberDeparture: details.flightDetails?.departure || "",
      }));
    } else {
      // No service details found, redirect to price estimator
      router.replace("/#estimate");
      return;
    }
  }, [router]);

  const handleAuthChoice = async (choice: "signup" | "signin" | "guest") => {
    setShowAuthModal(false);
    if (choice === "signup") {
      window.location.href = `/user/signup?from=booking`;
    } else if (choice === "signin") {
      window.location.href = `/user/signin?from=booking`;
    } else {
      // Handle guest checkout with Stripe
      try {
        const pickupLocation = locations.find(loc => loc.id === bookingDetails.pickupLocationId);
        const dropoffLocation = locations.find(loc => loc.id === bookingDetails.dropoffLocationId);
        
        if (!pickupLocation) {
          setNotification({
            type: "error",
            message: "Pickup location is required",
          });
          return;
        }

        if (!bookingDetails.date) {
          setNotification({
            type: "error",
            message: "Date is required",
          });
      return;
    }

        const dateTime = new Date(
          bookingDetails.date.getFullYear(),
          bookingDetails.date.getMonth(),
          bookingDetails.date.getDate(),
          parseInt(bookingDetails.hour),
          parseInt(bookingDetails.minute)
        ).toISOString();

        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingDetails: {
              fullName: bookingDetails.fullName,
              email: bookingDetails.email,
              phone: bookingDetails.phone,
              pickupLocation: pickupLocation.name,
              dropoffLocation: dropoffLocation?.name,
              dateTime,
              service_type: bookingDetails.service_type,
              service_subtype: bookingDetails.service_subtype,
              isHireByHour: bookingDetails.service_type === "hourlyHire",
              duration: bookingDetails.additionalHours,
              durationUnit: "hours",
              additionalRequests: bookingDetails.additionalRequests,
              flightNumberArrival: bookingDetails.flightNumberArrival,
              flightNumberDeparture: bookingDetails.flightNumberDeparture,
              passengers: bookingDetails.passengers,
              bags: bookingDetails.bags,
              wantBuggy: bookingDetails.wantBuggy,
              wantPorter: bookingDetails.wantPorter,
              contactConsent: true, // Required for guest checkout
            },
            amount: calculateEstimatedCost(),
          }),
        });

        const { url, error } = await response.json();

        if (error) {
          setNotification({
            type: "error",
            message: error,
          });
          return;
        }

        // Redirect to Stripe Checkout
        window.location.href = url;
    } catch (err) {
        console.error("Payment error:", err);
      setNotification({
        type: "error",
          message: "Failed to process payment. Please try again.",
        });
      }
    }
  };


  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // Validate date and time
    const errors: Record<string, string> = {};
    if (!bookingDetails.date) errors.date = "Date is required";
    if (!bookingDetails.hour || !bookingDetails.minute) errors.time = "Time is required";
    
    if (Object.keys(errors).length > 0) {
      setNotification({
        type: "error",
        message: Object.values(errors).join("\n"),
      });
      return;
    }

    // Fetch user data before moving to step 2
    const user = auth.currentUser;
    if (user) {
      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        if (profileDoc.exists()) {
          setBookingDetails((prev) => ({
            ...prev,
            fullName: `${profileDoc.data().firstName} ${profileDoc.data().lastName}`,
            email: user.email || "",
            phone: profileDoc.data().phone || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch user data");
      }
    }

    setShowAuthModal(true);
  };

  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    let basePrice = 0;
    switch (bookingDetails.service_type) {
      case "meetAndGreet":
        basePrice = bookingDetails.service_subtype === "connection" ? 280 : 140;
        break;
      case "airportTransfer":
        basePrice = 100;
        break;
      case "hourlyHire":
        basePrice = bookingDetails.additionalHours * 180;
        break;
    }

    if (bookingDetails.wantBuggy) basePrice += 80;
    if (bookingDetails.wantPorter) basePrice += 65;
    if (bookingDetails.bags > 0) basePrice += bookingDetails.bags * 10;

    // Add VAT (20%)
    const vatAmount = basePrice * 0.20;
    return basePrice + vatAmount;
  };

  if (locationsLoading) {
    return (
      <div className="min-h-screen bg-muted p-6">
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-64">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen">
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Book Your Journey
          </h1>
        </div>
      </div>

      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          {notification && (
            <div
              className={`p-4 mb-4 rounded ${
                notification.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {notification.message}
            </div>
          )}

          {locationsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : locationsError ? (
            <p className="text-red-500 text-center">{locationsError}</p>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-1/2 bg-gray-200 p-4 md:p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">Booking Summary</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/#estimate')}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Go Back
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm md:text-base">
                    <p>
                      <strong>Service Type:</strong>{" "}
                      {bookingDetails.service_type === "meetAndGreet"
                        ? `Meet and Greet (${bookingDetails.service_subtype})`
                        : bookingDetails.service_type === "airportTransfer"
                        ? "Airport Transfer"
                        : "Daily Hire"}
                    </p>
                    <p>
                      <strong>
                        {bookingDetails.service_subtype === "connection"
                          ? "Arrival Terminal"
                          : "Pickup Location"}
                        :
                      </strong>{" "}
                      {locations.find(
                        (loc) => loc.id === bookingDetails.pickupLocationId
                      )?.name || "Not selected"}
                    </p>
                    {bookingDetails.service_type === "meetAndGreet" &&
                      bookingDetails.service_subtype === "connection" && (
                        <p>
                          <strong>Departure Terminal:</strong>{" "}
                          {locations.find(
                            (loc) =>
                              loc.id === bookingDetails.dropoffLocationId
                          )?.name || "Not selected"}
                        </p>
                    )}
                    <p>
                      <strong>Date:</strong>{" "}
                      {bookingDetails.date
                        ? new Date(bookingDetails.date).toLocaleDateString()
                        : "Not selected"}
                    </p>
                    <p>
                      <strong>Time:</strong>{" "}
                      {bookingDetails.hour &&
                            bookingDetails.minute
                        ? `${bookingDetails.hour}:${bookingDetails.minute}`
                        : "Not selected"}
                    </p>
                    {bookingDetails.service_type === "meetAndGreet" && (
                      <>
                        <p>
                          <strong>Passengers:</strong>{" "}
                          {bookingDetails.passengers}
                        </p>
                        <p>
                          <strong>Additional Hours:</strong>{" "}
                          {bookingDetails.additionalHours}
                        </p>
                        <p>
                          <strong>Bags:</strong> {bookingDetails.bags}
                        </p>
                        <p>
                          <strong>Buggy:</strong>{" "}
                          {bookingDetails.wantBuggy ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Porter:</strong>{" "}
                          {bookingDetails.wantPorter ? "Yes" : "No"}
                        </p>
                      </>
                    )}
                    {(bookingDetails.service_type === "airportTransfer" ||
                      bookingDetails.service_type === "hourlyHire") && (
                      <>
                        <p>
                          <strong>Passengers:</strong>{" "}
                          {bookingDetails.passengers}
                        </p>
                        <p>
                          <strong>Additional Hours:</strong>{" "}
                          {bookingDetails.additionalHours}
                        </p>
                      </>
                    )}
                    <div className="border-t pt-4 mt-4">
                      <p className="text-lg font-semibold">
                        <strong>Estimated Cost:</strong> £{calculateEstimatedCost().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="lg:w-1/2 bg-gray-50 p-4 md:p-6 rounded-lg">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Enter Your Details</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {bookingDetails.service_type === "meetAndGreet" && (
                      <>
                        {(bookingDetails.service_subtype === "arrival" || 
                          bookingDetails.service_subtype === "connection") && (
                          <div>
                            <Label>
                              Arrival Flight Number
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              value={bookingDetails.flightNumberArrival}
                              onChange={(e) =>
                                setBookingDetails((prev) => ({
                                  ...prev,
                                  flightNumberArrival: e.target.value,
                                }))
                              }
                              placeholder="Enter arrival flight number"
                            />
                          </div>
                        )}
                        {(bookingDetails.service_subtype === "departure" || 
                          bookingDetails.service_subtype === "connection") && (
                          <div>
                            <Label>
                              Departure Flight Number
                              <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              value={bookingDetails.flightNumberDeparture}
                              onChange={(e) =>
                                setBookingDetails((prev) => ({
                                  ...prev,
                                  flightNumberDeparture: e.target.value,
                                }))
                              }
                              placeholder="Enter departure flight number"
                            />
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <Label>
                        Full Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        value={bookingDetails.fullName}
                        onChange={(e) =>
                          setBookingDetails((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }))
                        }
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label>
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        type="email"
                        value={bookingDetails.email}
                        onChange={(e) =>
                          setBookingDetails((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label>
                        Phone Number
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        type="tel"
                        value={bookingDetails.phone}
                        onChange={(e) =>
                          setBookingDetails((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label>Additional Notes</Label>
                      <Textarea
                        value={bookingDetails.additionalRequests}
                        onChange={(e) =>
                          setBookingDetails((prev) => ({
                            ...prev,
                            additionalRequests: e.target.value,
                          }))
                        }
                        placeholder="Any additional requests or information"
                      />
                    </div>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowAuthModal(true)}
                        className="w-full"
                      >
                        Continue to Booking
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue Your Booking</DialogTitle>
            <DialogDescription>
              Would you like to sign up or sign in to save your booking history, track your booking status, receive updates, and make changes?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button onClick={() => handleAuthChoice("signup")}>Sign Up</Button>
            <Button onClick={() => handleAuthChoice("signin")}>Sign In</Button>
            {!user && (
              <Button variant="outline" onClick={() => handleAuthChoice("guest")}>
                Continue as Guest
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingContent />
    </Suspense>
  );
}