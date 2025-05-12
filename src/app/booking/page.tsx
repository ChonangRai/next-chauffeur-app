"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import VehicleServiceCard from "../../components/vehicle/vehicle";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import Notification from "../../components/ui/notification";
import { Vehicle } from "../../types/admin";

// Predefined locations
const PREDEFINED_LOCATIONS = [
  "Gatwick Airport",
  "Luton Airport",
  "London City",
  "Heathrow Airport",
];

// Mock distance calculation based on predefined routes (in miles)
const calculateMockDistance = (pickup: string, dropoff: string): number => {
  const normalizedPickup = pickup.toLowerCase();
  const normalizedDropoff = dropoff.toLowerCase();

  // Mock distances for common routes
  const distanceMap: Record<string, Record<string, number>> = {
    "gatwick airport": {
      "luton airport": 50,
      "london city": 30,
      "heathrow airport": 40,
    },
    "luton airport": {
      "gatwick airport": 50,
      "london city": 35,
      "heathrow airport": 45,
    },
    "london city": {
      "gatwick airport": 30,
      "luton airport": 35,
      "heathrow airport": 20,
    },
    "heathrow airport": {
      "gatwick airport": 40,
      "luton airport": 45,
      "london city": 20,
    },
  };

  if (normalizedPickup === normalizedDropoff) return 0;
  return distanceMap[normalizedPickup]?.[normalizedDropoff] || 50; // Default to 50 miles if not a predefined route
};

type BookingDetails = {
  pickupLocation: string;
  dropoffLocation: string;
  duration: number;
  durationUnit: string;
  dateTime: string;
  fullName: string;
  email: string;
  phone: string;
  additionalRequests: string;
  isHireByHour: boolean;
  isDailyHire: boolean;
  contactConsent: boolean;
};

export default function BookingPage() {
  const [isHireByHour, setIsHireByHour] = useState(false);
  const [isDailyHire, setIsDailyHire] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickupLocation: "Gatwick Airport",
    dropoffLocation: "London City",
    duration: 1,
    durationUnit: "hours",
    dateTime: "",
    fullName: "",
    email: "",
    phone: "",
    additionalRequests: "",
    isHireByHour: false,
    isDailyHire: false,
    contactConsent: false,
  });

  const now = new Date();
  const minDateTime = new Date(now.getTime() + 5 * 60 * 1000);
  const minDateTimeString = minDateTime.toISOString().slice(0, 16);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .order("price_per_hour", { ascending: true });
        if (error) throw new Error(error.message);
        setVehicles(data || []);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error fetching vehicles:", error);
        setVehiclesError("Failed to load vehicles. Please try again.");
      }
      finally {
        setVehiclesLoading(false);
      }
    };

    fetchVehicles();

    const savedDetails = localStorage.getItem("bookingDetails");
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      setBookingDetails(parsedDetails);
      setIsHireByHour(parsedDetails.isHireByHour);
      setIsDailyHire(parsedDetails.isDailyHire);
      setShowVehicles(true);
      setFormErrors({});
    }
  }, []);

  useEffect(() => {
    if (!selectedVehicle) {
      setCalculatedAmount(null);
      return;
    }

    const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
    if (!selectedVehicleData) {
      setCalculatedAmount(null);
      return;
    }

    let amount: number;
    if (isHireByHour) {
      const hoursMultiplier = bookingDetails.durationUnit === "days" ? 24 : 1;
      amount = selectedVehicleData.price_per_hour * bookingDetails.duration * hoursMultiplier;
    } else if (isDailyHire) {
      amount = selectedVehicleData.daily_rate || selectedVehicleData.base_price * 24; // Default to 24x base_price if no daily_rate
    } else {
      const distance = calculateMockDistance(
        bookingDetails.pickupLocation,
        bookingDetails.dropoffLocation
      );
      const ratePerMile = 2;
      amount = selectedVehicleData.base_price + distance * ratePerMile;
    }
    setCalculatedAmount(amount);
  }, [selectedVehicle, bookingDetails, isHireByHour, isDailyHire, vehicles]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setBookingDetails((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 5 * 60 * 1000);

    if (!bookingDetails.pickupLocation)
      errors.pickupLocation = "Pickup location is required";
    if (!isHireByHour && !isDailyHire && !bookingDetails.dropoffLocation)
      errors.dropoffLocation = "Drop-off location is required";
    if (isHireByHour && bookingDetails.duration < 1)
      errors.duration = "Duration must be at least 1";
    if (!bookingDetails.dateTime)
      errors.dateTime = "Date and time is required";
    else if (new Date(bookingDetails.dateTime) < bufferTime)
      errors.dateTime = "Date/time must be at least 5 minutes in the future";
    if (!bookingDetails.fullName) errors.fullName = "Full name is required";
    if (!bookingDetails.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(bookingDetails.email))
      errors.email = "Email is invalid";
    if (!bookingDetails.phone) errors.phone = "Phone is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
      setShowVehicles(true);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("bookingDetails");
    setShowVehicles(false);
    setSelectedVehicle(null);
    setFormErrors({});
    setNotification(null);
    setCalculatedAmount(null);
    setBookingDetails({
      pickupLocation: "Gatwick Airport",
      dropoffLocation: "London City",
      duration: 1,
      durationUnit: "hours",
      dateTime: "",
      fullName: "",
      email: "",
      phone: "",
      additionalRequests: "",
      isHireByHour: false,
      isDailyHire: false,
      contactConsent: false,
    });
    setIsHireByHour(false);
    setIsDailyHire(false);
  };

  const handlePayment = async () => {
    if (!selectedVehicle || isProcessing || calculatedAmount === null) return;
    setIsProcessing(true);
    setNotification(null);

    try {
      const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
      if (!selectedVehicleData) throw new Error("Selected vehicle not found");

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingDetails: {
            selectedVehicle: selectedVehicleData.name,
            fullName: bookingDetails.fullName,
            email: bookingDetails.email,
            phone: bookingDetails.phone,
            pickupLocation: bookingDetails.pickupLocation,
            dropoffLocation: bookingDetails.dropoffLocation,
            additionalRequests: bookingDetails.additionalRequests,
            dateTime: bookingDetails.dateTime,
            isHireByHour: bookingDetails.isHireByHour,
            isDailyHire: bookingDetails.isDailyHire,
            duration: bookingDetails.isHireByHour ? bookingDetails.duration : null,
            durationUnit: bookingDetails.isHireByHour ? bookingDetails.durationUnit : null,
            contactConsent: bookingDetails.contactConsent,
          },
          amount: calculatedAmount,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response received:", text);
        throw new Error(`Expected JSON response, but received: ${text.slice(0, 100)}...`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment");
      }

      const { url } = data;
      setNotification({ type: "success", message: "Redirecting to payment..." });
      window.location.href = url;
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Payment error:", err);
      setNotification({
        type: "error",
        message: err.message || "Something went wrong while processing payment. Please try again.",
      });
      setIsProcessing(false);
    }

  };

  return (
    <main className="flex flex-col min-h-screen">
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Book Your Ride
          </h1>
        </div>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          {notification && (
            <Notification type={notification.type} message={notification.message} />
          )}

          {vehiclesLoading ? (
            <p className="text-center text-gray-600">Loading vehicles...</p>
          ) : vehiclesError ? (
            <p className="text-red-500 text-center">{vehiclesError}</p>
          ) : !showVehicles ? (
            <div className="bg-muted p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Enter Your Journey Details</h2>
              <form onSubmit={handleContinue} className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <Button
                    variant={!isHireByHour && !isDailyHire ? "default" : "outline"}
                    onClick={() => {
                      setIsHireByHour(false);
                      setIsDailyHire(false);
                      setBookingDetails((prev) => ({
                        ...prev,
                        isHireByHour: false,
                        isDailyHire: false,
                        dropoffLocation: prev.dropoffLocation || "",
                      }));
                    }}
                    className="w-1/3"
                    type="button"
                  >
                    One Way
                  </Button>
                  <Button
                    variant={isHireByHour ? "default" : "outline"}
                    onClick={() => {
                      setIsHireByHour(true);
                      setIsDailyHire(false);
                      setBookingDetails((prev) => ({
                        ...prev,
                        isHireByHour: true,
                        isDailyHire: false,
                        dropoffLocation: "",
                      }));
                    }}
                    className="w-1/3"
                    type="button"
                  >
                    Hire By Hour
                  </Button>
                  <Button
                    variant={isDailyHire ? "default" : "outline"}
                    onClick={() => {
                      setIsHireByHour(false);
                      setIsDailyHire(true);
                      setBookingDetails((prev) => ({
                        ...prev,
                        isHireByHour: false,
                        isDailyHire: true,
                        dropoffLocation: "",
                      }));
                    }}
                    className="w-1/3"
                    type="button"
                  >
                    Daily Hire
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="pickupLocation" className="text-sm font-medium">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={bookingDetails.pickupLocation}
                    onValueChange={handleSelectChange("pickupLocation")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pickup location" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_LOCATIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.pickupLocation && (
                    <p className="text-red-500 text-sm">{formErrors.pickupLocation}</p>
                  )}
                </div>

                {!isHireByHour && !isDailyHire && (
                  <div className="space-y-2">
                    <label htmlFor="dropoffLocation" className="text-sm font-medium">
                      Drop-off Location <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={bookingDetails.dropoffLocation}
                      onValueChange={handleSelectChange("dropoffLocation")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select drop-off location" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREDEFINED_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.dropoffLocation && (
                      <p className="text-red-500 text-sm">{formErrors.dropoffLocation}</p>
                    )}
                  </div>
                )}

                {isHireByHour && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        className="w-1/3"
                        value={bookingDetails.duration}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          setBookingDetails((prev) => ({
                            ...prev,
                            duration: isNaN(value) ? 1 : value,
                          }));
                        }}
                      />
                      <Select
                        value={bookingDetails.durationUnit}
                        onValueChange={handleSelectChange("durationUnit")}
                      >
                        <SelectTrigger className="w-2/3">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formErrors.duration && (
                      <p className="text-red-500 text-sm">{formErrors.duration}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="dateTime" className="text-sm font-medium">
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={bookingDetails.dateTime}
                    onChange={handleInputChange}
                    required
                    min={minDateTimeString}
                  />
                  {formErrors.dateTime && (
                    <p className="text-red-500 text-sm">{formErrors.dateTime}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    value={bookingDetails.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-sm">{formErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingDetails.email}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={bookingDetails.phone}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm">{formErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="additionalRequests" className="text-sm font-medium">
                    Additional Requests
                  </label>
                  <Textarea
                    id="additionalRequests"
                    value={bookingDetails.additionalRequests}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={bookingDetails.contactConsent}
                      onChange={(e) =>
                        setBookingDetails((prev) => ({
                          ...prev,
                          contactConsent: e.target.checked,
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm">
                      I agree to be contacted if there are issues with my booking.
                    </span>
                  </label>
                </div>

                <Button type="submit" className="w-full">
                  Find Available Vehicles
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold mb-4">Your Journey Details</h2>
                  <Button variant="outline" onClick={handleReset}>
                    Edit Details
                  </Button>
                </div>
                <p><strong>Service Type:</strong> {isHireByHour ? "Hire By Hour" : isDailyHire ? "Daily Hire" : "One Way"}</p>
                {isHireByHour ? (
                  <p><strong>Duration:</strong> {bookingDetails.duration} {bookingDetails.durationUnit}</p>
                ) : isDailyHire ? (
                  <p><strong>Duration:</strong> 1 Day</p>
                ) : (
                  <>
                    <p><strong>Drop-off Location:</strong> {bookingDetails.dropoffLocation}</p>
                    <p><strong>Estimated Distance:</strong> {calculateMockDistance(bookingDetails.pickupLocation, bookingDetails.dropoffLocation)} miles</p>
                  </>
                )}
                <p><strong>Pickup Location:</strong> {bookingDetails.pickupLocation}</p>
                <p><strong>Date & Time:</strong> {new Date(bookingDetails.dateTime).toLocaleString()}</p>
                {calculatedAmount !== null && (
                  <p><strong>Estimated Cost:</strong> £{calculatedAmount.toFixed(2)}</p>
                )}
              </div>

              <h2 className="text-2xl font-bold mt-8">Available Vehicles</h2>
              <div className="space-y-6">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id}>
                    <VehicleServiceCard
                      title={isHireByHour ? "Hire By Hour" : isDailyHire ? "Daily Hire" : "One Way"}
                      name={vehicle.name}
                      description={vehicle.description}
                      passengers={vehicle.passengers}
                      bags={vehicle.bags}
                      wifi={vehicle.wifi}
                      meetGreet={vehicle.meet_greet}
                      drinks={vehicle.drinks}
                      waitingTime={vehicle.waiting_time}
                      price={isHireByHour ? vehicle.price_per_hour : isDailyHire ? (vehicle.daily_rate || vehicle.base_price * 24) : vehicle.base_price}
                      selected={selectedVehicle === vehicle.id}
                      onSelect={() => setSelectedVehicle(vehicle.id)}
                    />
                    {selectedVehicle === vehicle.id && (
                      <Button
                        className="w-full mt-4"
                        onClick={handlePayment}
                        disabled={isProcessing || calculatedAmount === null}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Processing...
                          </div>
                        ) : (
                          "Proceed to Payment"
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}