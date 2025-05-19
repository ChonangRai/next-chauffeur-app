"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import JourneyForm from "@/components/price-estimator/components/JourneyForm";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
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
  serviceType: "meetAndAssist" | "airportTransfer" | "hireByHour";
  calculatedAmount: number | null;
  meetAndGreetType: "arrival" | "departure" | "connection";
  flightNumberArrival: string;
  flightNumberDeparture: string;
  airportTransferType?: "one_way" | "round_trip";
  hireDuration?: "full_day" | "half_day";
};

function BookingContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"estimate" | "details">("estimate");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    serviceType: "meetAndAssist",
    calculatedAmount: null,
    meetAndGreetType: "arrival",
    flightNumberArrival: "",
    flightNumberDeparture: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locationsData = await getLocations();
        setLocations(locationsData);
        if (
          locationsData.length > 0 &&
          !bookingDetails.pickupLocationId &&
          !searchParams.get("pickupLocationId")
        ) {
          setBookingDetails((prev) => ({
            ...prev,
            pickupLocationId: locationsData[0].id,
            calculatedAmount: null,
          }));
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setLocationsError("Failed to load locations. Please try again.");
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();

    const serviceType = searchParams.get("serviceType") as
      | "meetAndAssist"
      | "airportTransfer"
      | "hireByHour"
      | null;
    if (serviceType && searchParams.get("fromEstimator") === "true") {
      const dateTime = searchParams.get("dateTime")
        ? new Date(searchParams.get("dateTime")!)
        : undefined;
      const hour = dateTime
        ? (dateTime.getHours() % 12 || 12).toString().padStart(2, "0")
        : "";
      const minute = dateTime
        ? dateTime.getMinutes().toString().padStart(2, "0")
        : "";
      const period = dateTime ? (dateTime.getHours() >= 12 ? "pm" : "am") : "";

      setBookingDetails((prev) => ({
        ...prev,
        serviceType,
        pickupLocationId: searchParams.get("pickupLocationId") || null,
        dropoffLocationId: searchParams.get("dropoffLocationId") || null,
        date: dateTime,
        hour,
        minute,
        period,
        passengers: parseInt(searchParams.get("passengers") || "1"),
        additionalHours: parseInt(searchParams.get("additionalHours") || "0"),
        bags: parseInt(searchParams.get("bags") || "0"),
        wantBuggy: searchParams.get("wantBuggy") === "true",
        wantPorter: searchParams.get("wantPorter") === "true",
        calculatedAmount: parseFloat(
          searchParams.get("estimatedPrice")?.replace("£", "") || "0"
        ),
        meetAndGreetType:
          (searchParams.get("meetAndGreetType") as
            | "arrival"
            | "departure"
            | "connection") || "arrival",
        flightNumberArrival: searchParams.get("flightNumberArrival") || "",
        flightNumberDeparture: searchParams.get("flightNumberDeparture") || "",
      }));
      setStep("details");
    }
  }, [bookingDetails.pickupLocationId, searchParams]);

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
              selectedVehicle: bookingDetails.serviceType,
              isHireByHour: bookingDetails.serviceType === "hireByHour",
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

  const handleReset = () => {
    setFormErrors({});
    setNotification(null);
    setStep("estimate");
    setBookingDetails((prev) => ({
      ...prev,
      pickupLocationId: locations[0]?.id || null,
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
      serviceType: "meetAndAssist",
      calculatedAmount: null,
      meetAndGreetType: "arrival",
      flightNumberArrival: "",
      flightNumberDeparture: "",
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Validate date and time
    const errors: Record<string, string> = {};
    if (!bookingDetails.date) errors.date = "Date is required";
    if (!bookingDetails.hour || !bookingDetails.minute) errors.time = "Time is required";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setStep("details");
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Validate required fields
    const errors: Record<string, string> = {};
    if (!bookingDetails.fullName) errors.fullName = "Full name is required";
    if (!bookingDetails.email) errors.email = "Email is required";
    if (!bookingDetails.phone) errors.phone = "Phone number is required";
    
    // Validate flight numbers based on service type
    if (bookingDetails.serviceType === "meetAndAssist") {
      if ((bookingDetails.meetAndGreetType === "arrival" || 
           bookingDetails.meetAndGreetType === "connection") && 
          !bookingDetails.flightNumberArrival) {
        errors.flightNumberArrival = "Arrival flight number is required";
      }
      if ((bookingDetails.meetAndGreetType === "departure" || 
           bookingDetails.meetAndGreetType === "connection") && 
          !bookingDetails.flightNumberDeparture) {
        errors.flightNumberDeparture = "Departure flight number is required";
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setShowAuthModal(true);
  };

  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    let basePrice = 0;
    switch (bookingDetails.serviceType) {
      case "meetAndAssist":
        basePrice = bookingDetails.meetAndGreetType === "connection" ? 280 : 140;
        break;
      case "airportTransfer":
        basePrice = 100;
        break;
      case "hireByHour":
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
              {step === "estimate" ? (
                <div className="bg-muted p-4 md:p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Enter Your Journey Details</h2>
                  <JourneyForm
                    type={bookingDetails.serviceType}
                    locations={locations}
                    onCalculate={handleSubmit}
                    submitButtonText="Continue to Booking"
                    formData={{
                      date: bookingDetails.date,
                      hour: bookingDetails.hour,
                      minute: bookingDetails.minute,
                      meetAndAssistType: bookingDetails.meetAndGreetType,
                      passengers: bookingDetails.passengers,
                      wantBuggy: bookingDetails.wantBuggy,
                      wantPorter: bookingDetails.wantPorter,
                      bags: bookingDetails.bags,
                      additionalHours: bookingDetails.additionalHours,
                    }}
                    setFormData={{
                      setDate: (date: Date | undefined) =>
                        setBookingDetails((prev) => ({ ...prev, date })),
                      setHour: (hour: string) =>
                        setBookingDetails((prev) => ({ ...prev, hour })),
                      setMinute: (minute: string) =>
                        setBookingDetails((prev) => ({ ...prev, minute })),
                      setMeetAndAssistType: (type: "arrival" | "departure" | "connection") =>
                        setBookingDetails((prev) => ({ ...prev, meetAndGreetType: type })),
                      setPassengers: (passengers: number) =>
                        setBookingDetails((prev) => ({ ...prev, passengers })),
                      setWantBuggy: (want: boolean) =>
                        setBookingDetails((prev) => ({ ...prev, wantBuggy: want })),
                      setWantPorter: (want: boolean) =>
                        setBookingDetails((prev) => ({ ...prev, wantPorter: want })),
                      setBags: (bags: number) =>
                        setBookingDetails((prev) => ({ ...prev, bags })),
                      setAdditionalHours: (hours: number) =>
                        setBookingDetails((prev) => ({ ...prev, additionalHours: hours })),
                    }}
                  />

                  {Object.entries(formErrors).map(([field, message]) => (
                    <p
                      key={field}
                      className="text-red-500 text-xs flex items-center mt-2"
                    >
                      <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                      {message}
                    </p>
                  ))}

                  <div className="space-y-2 mt-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleReset}
                      className="w-full"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/2 bg-gray-200 p-4 md:p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">Booking Summary</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep("estimate")}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm md:text-base">
                      <p>
                        <strong>Service Type:</strong>{" "}
                        {bookingDetails.serviceType === "meetAndAssist"
                          ? `Meet and Greet (${bookingDetails.meetAndGreetType})`
                          : bookingDetails.serviceType === "airportTransfer"
                          ? "Airport Transfer"
                          : "Daily Hire"}
                      </p>
                      <p>
                        <strong>
                          {bookingDetails.meetAndGreetType === "connection"
                            ? "Arrival Terminal"
                            : "Pickup Location"}
                          :
                        </strong>{" "}
                        {locations.find(
                          (loc) => loc.id === bookingDetails.pickupLocationId
                        )?.name || "Not selected"}
                      </p>
                      {bookingDetails.serviceType === "meetAndAssist" &&
                        bookingDetails.meetAndGreetType === "connection" && (
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
                      {bookingDetails.serviceType === "meetAndAssist" && (
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
                      {(bookingDetails.serviceType === "airportTransfer" ||
                        bookingDetails.serviceType === "hireByHour") && (
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
                    <form onSubmit={handleFinalSubmit} className="space-y-4">
                      {bookingDetails.serviceType === "meetAndAssist" && (
                        <>
                          {(bookingDetails.meetAndGreetType === "arrival" || 
                            bookingDetails.meetAndGreetType === "connection") && (
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
                                className={formErrors.flightNumberArrival ? "border-red-500" : ""}
                              />
                              {formErrors.flightNumberArrival && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.flightNumberArrival}</p>
                              )}
                            </div>
                          )}
                          {(bookingDetails.meetAndGreetType === "departure" || 
                            bookingDetails.meetAndGreetType === "connection") && (
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
                                className={formErrors.flightNumberDeparture ? "border-red-500" : ""}
                              />
                              {formErrors.flightNumberDeparture && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.flightNumberDeparture}</p>
                              )}
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
                          className={formErrors.fullName ? "border-red-500" : ""}
                        />
                        {formErrors.fullName && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>
                        )}
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
                          className={formErrors.email ? "border-red-500" : ""}
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                        )}
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
                          className={formErrors.phone ? "border-red-500" : ""}
                        />
                        {formErrors.phone && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                        )}
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
                          onClick={() => setStep("estimate")}
                          className="w-full"
                        >
                          Back
                        </Button>
                        <Button 
                          type="submit" 
                          className="w-full"
                          onClick={() => setShowAuthModal(true)}
                        >
                          Continue to Booking
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Continue Your Booking</DialogTitle>
            <DialogDescription>
              Would you like to sign up or sign in to save your booking history, track your booking status, receive updates, and make changes? Or would you prefer to continue as a guest?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button onClick={() => handleAuthChoice("signup")}>Sign Up</Button>
            <Button onClick={() => handleAuthChoice("signin")}>Sign In</Button>
            <Button variant="outline" onClick={() => handleAuthChoice("guest")}>
              Continue as Guest
            </Button>
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