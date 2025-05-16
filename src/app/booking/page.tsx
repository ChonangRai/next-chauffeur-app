"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import JourneyForm from "@/components/price-estimator/components/JourneyForm";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
  serviceType: "meetAndGreet" | "airportTransfer" | "dailyHire";
  calculatedAmount: number | null;
  meetAndGreetType: "arrival" | "departure" | "connection";
  flightNumberArrival: string;
  flightNumberDeparture: string;
};

export default function Booking() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"estimate" | "details">("estimate");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [bookingId, setBookingId] = useState<number | null>(null);

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickupLocationId: null,
    dropoffLocationId: null,
    date: undefined,
    hour: "",
    minute: "",
    period: "",
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
    serviceType: "meetAndGreet",
    calculatedAmount: null,
    meetAndGreetType: "arrival",
    flightNumberArrival: "",
    flightNumberDeparture: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { data, error } = await supabase
          .from("locations")
          .select("id, airport, terminal, hotel_name_address")
          .eq("status", "active")
          .order("airport", { ascending: true });
        if (error) throw new Error(error.message);
        const locationList = data.map((loc) => ({
          id: loc.id,
          name: loc.hotel_name_address || (loc.terminal ? `${loc.airport} ${loc.terminal}` : loc.airport),
        })) || [];
        setLocations(locationList);
        if (locationList.length > 0 && !bookingDetails.pickupLocationId && !searchParams.get("pickupLocationId")) {
          setBookingDetails((prev) => ({ ...prev, pickupLocationId: locationList[0].id, calculatedAmount: null }));
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        setLocationsError("Failed to load locations. Please try again.");
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();

    const serviceType = searchParams.get("serviceType") as "meetAndGreet" | "airportTransfer" | "dailyHire" | null;
    if (serviceType && searchParams.get("fromEstimator") === "true") {
      const dateTime = searchParams.get("dateTime") ? new Date(searchParams.get("dateTime")!) : undefined;
      const hour = dateTime ? (dateTime.getHours() % 12 || 12).toString().padStart(2, "0") : "";
      const minute = dateTime ? dateTime.getMinutes().toString().padStart(2, "0") : "";
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
        calculatedAmount: parseFloat(searchParams.get("estimatedPrice")?.replace("£", "") || "0"),
        meetAndGreetType: (searchParams.get("meetAndGreetType") as "arrival" | "departure" | "connection") || "arrival",
        flightNumberArrival: searchParams.get("flightNumberArrival") || "",
        flightNumberDeparture: searchParams.get("flightNumberDeparture") || "",
      }));
      setStep("details");
    }
  }, [searchParams]);

  const calculateAmount = () => {
    let basePrice = 0;
    switch (bookingDetails.serviceType) {
      case "meetAndGreet":
        basePrice = bookingDetails.meetAndGreetType === "connection" ? 280 : 140;
        break;
      case "airportTransfer":
        basePrice = 100;
        break;
      case "dailyHire":
        basePrice = bookingDetails.additionalHours * 180;
        break;
    }
    const additionalPassengers = Math.max(0, bookingDetails.passengers - 2) * 45;
    const additionalHoursCost = bookingDetails.additionalHours * 50;
    const porterCost = Math.ceil(bookingDetails.bags / 8) * 65;
    const buggyCost = bookingDetails.wantBuggy ? 80 : 0;

    const amount = basePrice + additionalPassengers + additionalHoursCost + porterCost + buggyCost;
    setBookingDetails((prev) => ({ ...prev, calculatedAmount: amount }));
  };

  useEffect(() => {
    if (step === "details" && bookingDetails.calculatedAmount === null) {
      calculateAmount();
    } else if (step === "estimate" && bookingDetails.calculatedAmount === null) {
      calculateAmount();
    } else {
      calculateAmount(); // Recalculate whenever dependencies change
    }
  }, [step, bookingDetails.serviceType, bookingDetails.passengers, bookingDetails.additionalHours, bookingDetails.bags, bookingDetails.wantBuggy, bookingDetails.pickupLocationId]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!bookingDetails.pickupLocationId) errors.pickupLocation = "Pickup location is required";
    if (bookingDetails.serviceType === "meetAndGreet" && bookingDetails.meetAndGreetType === "connection" && !bookingDetails.dropoffLocationId) {
      errors.dropoffLocation = "Departure terminal is required for connection bookings";
    }
    if (!bookingDetails.date) errors.date = "Date is required";
    if (!bookingDetails.hour || !bookingDetails.minute || !bookingDetails.period) errors.time = "Time is required";
    if (!bookingDetails.fullName) errors.fullName = "Full name is required";
    if (!bookingDetails.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(bookingDetails.email)) errors.email = "Email is invalid";
    if (!bookingDetails.phone) errors.phone = "Phone is required";
    if (bookingDetails.serviceType === "meetAndGreet") {
      if (bookingDetails.meetAndGreetType === "arrival" || bookingDetails.meetAndGreetType === "connection") {
        if (!bookingDetails.flightNumberArrival) errors.flightNumberArrival = "Arrival flight number is required";
      }
      if (bookingDetails.meetAndGreetType === "departure" || bookingDetails.meetAndGreetType === "connection") {
        if (!bookingDetails.flightNumberDeparture) errors.flightNumberDeparture = "Departure flight number is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, proceedToDetails?: boolean) => {
    e.preventDefault();
    if (proceedToDetails && step === "estimate") {
      setStep("details");
      return;
    }

    if (!validateForm() || !bookingDetails.calculatedAmount) return;

    setIsProcessing(true);
    setNotification(null);

    try {
      const hour24 = bookingDetails.period === "pm"
        ? (bookingDetails.hour === "12" ? 12 : parseInt(bookingDetails.hour) + 12)
        : (bookingDetails.hour === "12" ? 0 : parseInt(bookingDetails.hour));
      const dateTime = bookingDetails.date ? new Date(bookingDetails.date) : new Date();
      dateTime.setHours(hour24, parseInt(bookingDetails.minute), 0, 0);

      console.log(await supabase.from("bookings").select("*").limit(1))
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: null,
          service_type: bookingDetails.serviceType,
          booking_date_time: dateTime.toISOString(),
          full_name: bookingDetails.fullName,
          contact_email: bookingDetails.email,
          contact_number: bookingDetails.phone,
          additional_requests: bookingDetails.additionalRequests,
          contact_consent: bookingDetails.contactConsent,
          amount: bookingDetails.calculatedAmount,
        })
        .select("id")
        .single();

      if (bookingError) throw new Error(bookingError.message);

      const newBookingId = bookingData.id;
      setBookingId(newBookingId);

      const { error: detailsError } = await supabase.from("booking_details").insert({
        booking_id: newBookingId,
        passengers: bookingDetails.passengers,
        additional_hours: bookingDetails.additionalHours,
        bags: bookingDetails.bags,
        want_buggy: bookingDetails.wantBuggy,
        want_porter: bookingDetails.wantPorter,
        initial_point_id: bookingDetails.pickupLocationId,
        ...(bookingDetails.serviceType === "meetAndGreet" && bookingDetails.meetAndGreetType === "connection" && {
          final_point_id: bookingDetails.dropoffLocationId,
        }),
      });

      if (detailsError) throw new Error(detailsError.message);

      setNotification({
        type: "success",
        message: "Booking created successfully!",
      });
      setShowAuthModal(true);
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create booking. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthChoice = (choice: "signup" | "signin" | "guest") => {
    setShowAuthModal(false);
    if (choice === "signup") {
      window.location.href = `/user/signup?bookingId=${bookingId}`;
    } else if (choice === "signin") {
      window.location.href = `/user/signin?bookingId=${bookingId}`;
    } else {
      window.location.href = "/payment";
    }
  };

  const handleReset = () => {
    setFormErrors({});
    setNotification(null);
    setStep("estimate");
    setBookingDetails((prev) => {
      const updated: BookingDetails = {
        pickupLocationId: locations[0]?.id || null,
        dropoffLocationId: null,
        date: undefined,
        hour: "",
        minute: "",
        period: "",
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
        serviceType: "meetAndGreet", // Explicitly set to a valid union type value
        calculatedAmount: null,
        meetAndGreetType: "arrival",
        flightNumberArrival: "",
        flightNumberDeparture: "",
      };
      calculateAmount();
      return updated;
    });
  };

  return (
    <main className="flex flex-col min-h-screen">
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">Book Your Journey</h1>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {notification && (
            <div className={`p-4 mb-4 rounded ${notification.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
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
            <div className="max-w-5xl mx-auto">
              {step === "estimate" ? (
                <div className="bg-muted p-8 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-6">Enter Your Details</h2>
                  <JourneyForm
                    serviceType={bookingDetails.serviceType}
                    step={step}
                    date={bookingDetails.date}
                    setDate={(date) => setBookingDetails((prev) => ({ ...prev, date, calculatedAmount: null }))}
                    hour={bookingDetails.hour}
                    setHour={(hour) => setBookingDetails((prev) => ({ ...prev, hour, calculatedAmount: null }))}
                    minute={bookingDetails.minute}
                    setMinute={(minute) => setBookingDetails((prev) => ({ ...prev, minute, calculatedAmount: null }))}
                    period={bookingDetails.period}
                    setPeriod={(period) => setBookingDetails((prev) => ({ ...prev, period, calculatedAmount: null }))}
                    pickupLocationId={bookingDetails.pickupLocationId}
                    setPickupLocationId={(pickupLocationId) => setBookingDetails((prev) => ({ ...prev, pickupLocationId, calculatedAmount: null }))} // Trigger recalc on location change
                    dropoffLocationId={bookingDetails.dropoffLocationId}
                    setDropoffLocationId={(dropoffLocationId) => setBookingDetails((prev) => ({ ...prev, dropoffLocationId, calculatedAmount: null }))}
                    vehicle=""
                    setVehicle={() => { }}
                    passengers={bookingDetails.passengers}
                    setPassengers={(passengers) => setBookingDetails((prev) => ({ ...prev, passengers, calculatedAmount: null }))}
                    additionalHours={bookingDetails.additionalHours}
                    setAdditionalHours={(additionalHours) => setBookingDetails((prev) => ({ ...prev, additionalHours, calculatedAmount: null }))}
                    wantBuggy={bookingDetails.wantBuggy}
                    setWantBuggy={(wantBuggy) => setBookingDetails((prev) => ({ ...prev, wantBuggy, calculatedAmount: null }))}
                    wantPorter={bookingDetails.wantPorter}
                    setWantPorter={(wantPorter) => setBookingDetails((prev) => ({ ...prev, wantPorter, calculatedAmount: null }))}
                    bags={bookingDetails.bags}
                    setBags={(bags) => setBookingDetails((prev) => ({ ...prev, bags, calculatedAmount: null }))}
                    meetAndGreetType={bookingDetails.meetAndGreetType}
                    setMeetAndGreetType={(meetAndGreetType) => setBookingDetails((prev) => ({ ...prev, meetAndGreetType, calculatedAmount: null }))}
                    festiveMessage=""
                    extraInfo={[]}
                    handleSubmit={handleSubmit}
                    locations={locations}
                    fullName={bookingDetails.fullName}
                    setFullName={(fullName) => setBookingDetails((prev) => ({ ...prev, fullName }))}
                    email={bookingDetails.email}
                    setEmail={(email) => setBookingDetails((prev) => ({ ...prev, email }))}
                    phone={bookingDetails.phone}
                    setPhone={(phone) => setBookingDetails((prev) => ({ ...prev, phone }))}
                    additionalRequests={bookingDetails.additionalRequests}
                    setAdditionalRequests={(additionalRequests) => setBookingDetails((prev) => ({ ...prev, additionalRequests }))}
                    contactConsent={bookingDetails.contactConsent}
                    setContactConsent={(contactConsent) => setBookingDetails((prev) => ({ ...prev, contactConsent }))}
                    calculatedAmount={bookingDetails.calculatedAmount}
                    locationError={null}
                    flightNumberArrival={bookingDetails.flightNumberArrival}
                    setFlightNumberArrival={(flightNumberArrival) => setBookingDetails((prev) => ({ ...prev, flightNumberArrival }))}
                    flightNumberDeparture={bookingDetails.flightNumberDeparture}
                    setFlightNumberDeparture={(flightNumberDeparture) => setBookingDetails((prev) => ({ ...prev, flightNumberDeparture }))}
                  />

                  {Object.entries(formErrors).map(([field, message]) => (
                    <p key={field} className="text-red-500 text-xs flex items-center mt-2">
                      <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                      {message}
                    </p>
                  ))}

                  <div className="space-y-2 mt-4">
                    <Button variant="outline" type="button" onClick={handleReset} className="w-full">
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/2 bg-gray-200 p-6 rounded-lg">
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
                    <div className="space-y-2">
                      <p><strong>Service Type:</strong> {bookingDetails.serviceType === "meetAndGreet" ? `Meet and Greet (${bookingDetails.meetAndGreetType})` : bookingDetails.serviceType === "airportTransfer" ? "Airport Transfer" : "Daily Hire"}</p>
                      <p><strong>{bookingDetails.meetAndGreetType === "connection" ? "Arrival Terminal" : "Pickup Location"}:</strong> {locations.find(loc => loc.id === bookingDetails.pickupLocationId)?.name || "Not selected"}</p>
                      {bookingDetails.serviceType === "meetAndGreet" && bookingDetails.meetAndGreetType === "connection" && (
                        <p><strong>Departure Terminal:</strong> {locations.find(loc => loc.id === bookingDetails.dropoffLocationId)?.name || "Not selected"}</p>
                      )}
                      {bookingDetails.serviceType === "meetAndGreet" && (
                        <>
                          {(bookingDetails.meetAndGreetType === "arrival" || bookingDetails.meetAndGreetType === "connection") && bookingDetails.flightNumberArrival && (
                            <p><strong>Arrival Flight Number:</strong> {bookingDetails.flightNumberArrival}</p>
                          )}
                          {(bookingDetails.meetAndGreetType === "departure" || bookingDetails.meetAndGreetType === "connection") && bookingDetails.flightNumberDeparture && (
                            <p><strong>Departure Flight Number:</strong> {bookingDetails.flightNumberDeparture}</p>
                          )}
                        </>
                      )}
                      <p><strong>Date:</strong> {bookingDetails.date ? new Date(bookingDetails.date).toLocaleDateString() : "Not selected"}</p>
                      <p><strong>Time:</strong> {bookingDetails.hour && bookingDetails.minute && bookingDetails.period ? `${bookingDetails.hour}:${bookingDetails.minute} ${bookingDetails.period.toUpperCase()}` : "Not selected"}</p>
                      {bookingDetails.serviceType === "meetAndGreet" && (
                        <>
                          <p><strong>Passengers:</strong> {bookingDetails.passengers}</p>
                          <p><strong>Additional Hours:</strong> {bookingDetails.additionalHours}</p>
                          <p><strong>Bags:</strong> {bookingDetails.bags}</p>
                          <p><strong>Buggy:</strong> {bookingDetails.wantBuggy ? "Yes" : "No"}</p>
                          <p><strong>Porter:</strong> {bookingDetails.wantPorter ? "Yes" : "No"}</p>
                        </>
                      )}
                      {(bookingDetails.serviceType === "airportTransfer" || bookingDetails.serviceType === "dailyHire") && (
                        <>
                          <p><strong>Passengers:</strong> {bookingDetails.passengers}</p>
                          <p><strong>Additional Hours:</strong> {bookingDetails.additionalHours}</p>
                        </>
                      )}
                      <p><strong>Estimated Cost:</strong> £{bookingDetails.calculatedAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="md:w-1/2 bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-2xl font-bold mb-6">Enter Your Details</h2>
                    <JourneyForm
                      serviceType={bookingDetails.serviceType}
                      step={step}
                      date={bookingDetails.date}
                      setDate={(date) => setBookingDetails((prev) => ({ ...prev, date }))}
                      hour={bookingDetails.hour}
                      setHour={(hour) => setBookingDetails((prev) => ({ ...prev, hour }))}
                      minute={bookingDetails.minute}
                      setMinute={(minute) => setBookingDetails((prev) => ({ ...prev, minute }))}
                      period={bookingDetails.period}
                      setPeriod={(period) => setBookingDetails((prev) => ({ ...prev, period }))}
                      pickupLocationId={bookingDetails.pickupLocationId}
                      setPickupLocationId={(pickupLocationId) => setBookingDetails((prev) => ({ ...prev, pickupLocationId }))}
                      dropoffLocationId={bookingDetails.dropoffLocationId}
                      setDropoffLocationId={(dropoffLocationId) => setBookingDetails((prev) => ({ ...prev, dropoffLocationId }))}
                      vehicle=""
                      setVehicle={() => { }}
                      passengers={bookingDetails.passengers}
                      setPassengers={(passengers) => setBookingDetails((prev) => ({ ...prev, passengers }))}
                      additionalHours={bookingDetails.additionalHours}
                      setAdditionalHours={(additionalHours) => setBookingDetails((prev) => ({ ...prev, additionalHours }))}
                      wantBuggy={bookingDetails.wantBuggy}
                      setWantBuggy={(wantBuggy) => setBookingDetails((prev) => ({ ...prev, wantBuggy }))}
                      wantPorter={bookingDetails.wantPorter}
                      setWantPorter={(wantPorter) => setBookingDetails((prev) => ({ ...prev, wantPorter }))}
                      bags={bookingDetails.bags}
                      setBags={(bags) => setBookingDetails((prev) => ({ ...prev, bags }))}
                      meetAndGreetType={bookingDetails.meetAndGreetType}
                      setMeetAndGreetType={(meetAndGreetType) => setBookingDetails((prev) => ({ ...prev, meetAndGreetType }))}
                      festiveMessage=""
                      extraInfo={[]}
                      handleSubmit={handleSubmit}
                      locations={locations}
                      fullName={bookingDetails.fullName}
                      setFullName={(fullName) => setBookingDetails((prev) => ({ ...prev, fullName }))}
                      email={bookingDetails.email}
                      setEmail={(email) => setBookingDetails((prev) => ({ ...prev, email }))}
                      phone={bookingDetails.phone}
                      setPhone={(phone) => setBookingDetails((prev) => ({ ...prev, phone }))}
                      additionalRequests={bookingDetails.additionalRequests}
                      setAdditionalRequests={(additionalRequests) => setBookingDetails((prev) => ({ ...prev, additionalRequests }))}
                      contactConsent={bookingDetails.contactConsent}
                      setContactConsent={(contactConsent) => setBookingDetails((prev) => ({ ...prev, contactConsent }))}
                      calculatedAmount={bookingDetails.calculatedAmount}
                      locationError={null}
                      flightNumberArrival={bookingDetails.flightNumberArrival}
                      setFlightNumberArrival={(flightNumberArrival) => setBookingDetails((prev) => ({ ...prev, flightNumberArrival }))}
                      flightNumberDeparture={bookingDetails.flightNumberDeparture}
                      setFlightNumberDeparture={(flightNumberDeparture) => setBookingDetails((prev) => ({ ...prev, flightNumberDeparture }))}
                    />

                    {Object.entries(formErrors).map(([field, message]) => (
                      <p key={field} className="text-red-500 text-xs flex items-center mt-2">
                        <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                        {message}
                      </p>
                    ))}

                    <div className="space-y-2 mt-4">
                      <Button variant="outline" type="button" onClick={handleReset} className="w-full">
                        Reset
                      </Button>
                    </div>
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
              Would you like to sign up or sign in to save your booking history, or check out as a guest?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Button onClick={() => handleAuthChoice("signup")}>Sign Up</Button>
            <Button onClick={() => handleAuthChoice("signin")}>Sign In</Button>
            <Button variant="outline" onClick={() => handleAuthChoice("guest")}>
              Check Out as Guest
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}