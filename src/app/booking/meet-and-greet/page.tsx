"use client";
import { useEffect, useState } from "react";
import { format, addDays, startOfDay, isBefore } from "date-fns";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import JourneyForm from "@/components/price-estimator/components/JourneyForm";
import Notification from "@/components/ui/notification";

type BookingDetails = {
  pickupLocation: string;
  date: Date | undefined;
  hour: string;
  minute: string;
  period: string;
  fullName: string;
  email: string;
  phone: string;
  additionalRequests: string;
  meetAndGreetType: "arrival" | "departure" | "connection";
  passengers: number;
  additionalHours: number;
  bags: number;
  wantBuggy: boolean;
  wantPorter: boolean;
  contactConsent: boolean;
};

export default function MeetAndGreetBooking() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [locations, setLocations] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [festiveMessage, setFestiveMessage] = useState("");
  const [extraInfo, setExtraInfo] = useState<string[]>([]);

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickupLocation: "",
    date: addDays(new Date(), 1),
    hour: "",
    minute: "",
    period: "",
    fullName: "",
    email: "",
    phone: "",
    additionalRequests: "",
    meetAndGreetType: "arrival",
    passengers: 1,
    additionalHours: 0,
    bags: 0,
    wantBuggy: false,
    wantPorter: false,
    contactConsent: false,
  });

  const now = new Date();
  const minDate = addDays(startOfDay(now), 1); // Bookings start from the next day

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("name")
          .eq("status", "active")
          .order("name", { ascending: true });
        if (error) throw new Error(error.message);
        const locationNames = data.map((loc) => loc.name) || [];
        setLocations(locationNames);
        if (locationNames.length > 0 && !bookingDetails.pickupLocation) {
          setBookingDetails((prev) => ({ ...prev, pickupLocation: locationNames[0] }));
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setLocationsError("Failed to load locations. Please try again.");
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();

    const savedDetails = localStorage.getItem("bookingDetails");
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      if (parsedDetails.serviceType === "meetAndGreet") {
        const dateTime = parsedDetails.dateTime ? new Date(parsedDetails.dateTime) : addDays(new Date(), 1);
        const hour = dateTime ? (dateTime.getHours() % 12 || 12).toString().padStart(2, "0") : "";
        const minute = dateTime ? dateTime.getMinutes().toString().padStart(2, "0") : "";
        const period = dateTime ? (dateTime.getHours() >= 12 ? "pm" : "am") : "";

        setBookingDetails((prev) => ({
          ...prev,
          pickupLocation: parsedDetails.pickupLocation || prev.pickupLocation,
          date: dateTime,
          hour,
          minute,
          period,
          fullName: parsedDetails.fullName || "",
          email: parsedDetails.email || "",
          phone: parsedDetails.phone || "",
          additionalRequests: parsedDetails.additionalRequests || "",
          meetAndGreetType: parsedDetails.meetAndGreetType || "arrival",
          passengers: parseInt(parsedDetails.passengers) || 1,
          additionalHours: parseInt(parsedDetails.additionalHours) || 0,
          bags: parseInt(parsedDetails.bags) || 0,
          wantBuggy: parsedDetails.wantBuggy === "true",
          wantPorter: parsedDetails.wantPorter === "true",
          contactConsent: parsedDetails.contactConsent === "true",
        }));
      }
    }
  }, []);

  const calculateAmount = () => {
    const basePrice = bookingDetails.meetAndGreetType === "connection" ? 280 : 140;
    const additionalPassengers = Math.max(0, bookingDetails.passengers - 2) * 45;
    const additionalHoursCost = bookingDetails.additionalHours * 50;
    const porterCost = Math.ceil(bookingDetails.bags / 8) * 65;
    const buggyCost = bookingDetails.wantBuggy ? 80 : 0;

    const amount = basePrice + additionalPassengers + additionalHoursCost + porterCost + buggyCost;
    setCalculatedAmount(amount);
  };

  useEffect(() => {
    if (bookingDetails.passengers || bookingDetails.additionalHours || bookingDetails.bags || bookingDetails.wantBuggy || bookingDetails.meetAndGreetType) {
      calculateAmount();
    }
  }, [
    bookingDetails.passengers,
    bookingDetails.additionalHours,
    bookingDetails.bags,
    bookingDetails.wantBuggy,
    bookingDetails.meetAndGreetType,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setBookingDetails((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // 5-minute buffer

    if (!bookingDetails.pickupLocation) {
      errors.pickupLocation = "Pickup location is required";
    }

    if (!bookingDetails.date) {
      errors.date = "Date is required";
    } else if (isBefore(bookingDetails.date, minDate)) {
      errors.date = "Booking must be for the next day or later";
    }

    if (!bookingDetails.fullName) errors.fullName = "Full name is required";
    if (!bookingDetails.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) errors.email = "Email is invalid";
    if (!bookingDetails.phone) errors.phone = "Phone is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || calculatedAmount === null) return;

    setIsProcessing(true);
    setNotification(null);

    try {
      const hour24 = bookingDetails.period === "pm"
        ? (bookingDetails.hour === "12" ? 12 : parseInt(bookingDetails.hour) + 12)
        : (bookingDetails.hour === "12" ? 0 : parseInt(bookingDetails.hour));
      const dateTime = new Date(bookingDetails.date!);
      dateTime.setHours(hour24, parseInt(bookingDetails.minute), 0, 0);

      const { error } = await supabase.from("bookings").insert({
        service_type: "meet_and_greet",
        pickup_location: bookingDetails.pickupLocation,
        date_time: dateTime.toISOString(),
        full_name: bookingDetails.fullName,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        additional_requests: bookingDetails.additionalRequests,
        meet_and_greet_type: bookingDetails.meetAndGreetType,
        passengers: bookingDetails.passengers,
        additional_hours: bookingDetails.additionalHours,
        bags: bookingDetails.bags,
        want_buggy: bookingDetails.wantBuggy,
        want_porter: bookingDetails.wantPorter,
        contact_consent: bookingDetails.contactConsent,
        amount: calculatedAmount,
      });

      if (error) throw new Error(error.message);
      setNotification({
        type: "success",
        message: "Booking created successfully! Redirecting to payment...",
      });
      setTimeout(() => {
        window.location.href = "/payment";
      }, 2000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create booking. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("bookingDetails");
    setFormErrors({});
    setNotification(null);
    setCalculatedAmount(null);
    setBookingDetails({
      pickupLocation: locations[0] || "",
      date: addDays(new Date(), 1),
      hour: "",
      minute: "",
      period: "",
      fullName: "",
      email: "",
      phone: "",
      additionalRequests: "",
      meetAndGreetType: "arrival",
      passengers: 1,
      additionalHours: 0,
      bags: 0,
      wantBuggy: false,
      wantPorter: false,
      contactConsent: false,
    });
  };

  return (
    <main className="flex flex-col min-h-screen">
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Book Meet and Greet</h1>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {notification && <Notification type={notification.type} message={notification.message} />}

          {locationsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : locationsError ? (
            <p className="text-red-500 text-center">{locationsError}</p>
          ) : (
            <div className="bg-muted p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Enter Your Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <JourneyForm
                  serviceType="meetAndGreet"
                  date={bookingDetails.date}
                  setDate={(date) => setBookingDetails((prev) => ({ ...prev, date }))}
                  hour={bookingDetails.hour}
                  setHour={(hour) => setBookingDetails((prev) => ({ ...prev, hour }))}
                  minute={bookingDetails.minute}
                  setMinute={(minute) => setBookingDetails((prev) => ({ ...prev, minute }))}
                  period={bookingDetails.period}
                  setPeriod={(period) => setBookingDetails((prev) => ({ ...prev, period }))}
                  pickupLocation={bookingDetails.pickupLocation}
                  setPickupLocation={(pickupLocation) =>
                    setBookingDetails((prev) => ({ ...prev, pickupLocation }))
                  }
                  dropoffLocation=""
                  setDropoffLocation={() => {}}
                  vehicle=""
                  setVehicle={() => {}}
                  passengers={bookingDetails.passengers}
                  setPassengers={(passengers) => setBookingDetails((prev) => ({ ...prev, passengers }))}
                  additionalHours={bookingDetails.additionalHours}
                  setAdditionalHours={(additionalHours) =>
                    setBookingDetails((prev) => ({ ...prev, additionalHours }))
                  }
                  wantBuggy={bookingDetails.wantBuggy}
                  setWantBuggy={(wantBuggy) => setBookingDetails((prev) => ({ ...prev, wantBuggy }))}
                  wantPorter={bookingDetails.wantPorter}
                  setWantPorter={(wantPorter) => setBookingDetails((prev) => ({ ...prev, wantPorter }))}
                  bags={bookingDetails.bags}
                  setBags={(bags) => setBookingDetails((prev) => ({ ...prev, bags }))}
                  meetAndGreetType={bookingDetails.meetAndGreetType}
                  setMeetAndGreetType={(meetAndGreetType) =>
                    setBookingDetails((prev) => ({ ...prev, meetAndGreetType }))
                  }
                  festiveMessage={festiveMessage}
                  extraInfo={extraInfo}
                  handleSubmit={(e) => e.preventDefault()} // Override to prevent JourneyForm submission
                  locations={locations}
                />

                {formErrors.pickupLocation && (
                  <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                    {formErrors.pickupLocation}
                  </p>
                )}
                {formErrors.date && (
                  <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                    {formErrors.date}
                  </p>
                )}
                {formErrors.time && (
                  <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                    {formErrors.time}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                  <Input id="fullName" value={bookingDetails.fullName} onChange={handleInputChange} />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={bookingDetails.email} onChange={handleInputChange} />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                  <Input id="phone" type="tel" value={bookingDetails.phone} onChange={handleInputChange} />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalRequests">Additional Requests</Label>
                  <Textarea id="additionalRequests" value={bookingDetails.additionalRequests} onChange={handleInputChange} />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center">
                    <input
                      id="contactConsent"
                      type="checkbox"
                      checked={bookingDetails.contactConsent}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span>I agree to be contacted if there are issues with my booking.</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  {calculatedAmount !== null && (
                    <p className="text-lg font-semibold">Estimated Cost: £{calculatedAmount.toFixed(2)}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isProcessing}>
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing...
                      </div>
                    ) : (
                      "Book Now"
                    )}
                  </Button>
                  <Button variant="outline" type="button" onClick={handleReset} className="w-full">
                    Reset
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}