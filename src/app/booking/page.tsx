"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Use the regular supabase client for user-facing actions
import VehicleServiceCard from "@/components/vehicle/vehicle"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Notification from "@/components/ui/notification";
import { Vehicle } from "@/types/admin"; 

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
  contactConsent: boolean;
};

export default function BookingPage() {
  const [isHireByHour, setIsHireByHour] = useState(true); 
  const [showVehicles, setShowVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  const [bookingDetails, setBookingDetails] = useState<BookingDetails>({
    pickupLocation: "",
    dropoffLocation: "",
    duration: 1,
    durationUnit: "hours",
    dateTime: "",
    fullName: "",
    email: "",
    phone: "",
    additionalRequests: "",
    isHireByHour: true, // Default to Hire By Hour
    contactConsent: false,
  });

  // Get the current date and time for the min attribute (in the format required by datetime-local)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 5 * 60 * 1000); // Add 5 minutes buffer
  const minDateTimeString = minDateTime.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm

  // Fetch vehicles from Supabase
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .order("price_per_hour", { ascending: true });
        if (error) throw new Error(error.message);
        setVehicles(data || []);
      } catch (err: any) {
        console.error("Error fetching vehicles:", err);
        setVehiclesError("Failed to load vehicles. Please try again.");
      } finally {
        setVehiclesLoading(false);
      }
    };

    fetchVehicles();

    // Load saved details from localStorage
    const savedDetails = localStorage.getItem("bookingDetails");
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      setBookingDetails(parsedDetails);
      setIsHireByHour(parsedDetails.isHireByHour);
      setShowVehicles(true); // Updated from setShowCars
      setFormErrors({});
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setBookingDetails((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSelectChange = (value: string) => {
    setBookingDetails((prev) => ({ ...prev, durationUnit: value }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const now = new Date();
    const bufferTime = new Date(now.getTime() + 5 * 60 * 1000); // Add 5 minutes buffer

    if (!bookingDetails.pickupLocation)
      errors.pickupLocation = "Pickup location is required";
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
    setBookingDetails({
      pickupLocation: "",
      dropoffLocation: "",
      duration: 1,
      durationUnit: "hours",
      dateTime: "",
      fullName: "",
      email: "",
      phone: "",
      additionalRequests: "",
      isHireByHour: true,
      contactConsent: false,
    });
    setIsHireByHour(true);
  };

  const handlePayment = async () => {
    if (!selectedVehicle || isProcessing) return; 
    setIsProcessing(true);
    setNotification(null);

    try {
      const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle); 
      if (!selectedVehicleData) throw new Error("Selected vehicle not found");

      // Calculate amount for Hire By Hour
      const hoursMultiplier = bookingDetails.durationUnit === "days" ? 24 : 1;
      const amount = selectedVehicleData.price_per_hour * bookingDetails.duration * hoursMultiplier;

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
            duration: bookingDetails.duration,
            durationUnit: bookingDetails.durationUnit,
            contactConsent: bookingDetails.contactConsent,
          },
          amount,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to process payment");
      }

      const { url } = await response.json();
      setNotification({ type: "success", message: "Redirecting to payment..." });
      window.location.href = url;
    } catch (error: any) {
      console.error("Payment error:", error);
      setNotification({
        type: "error",
        message: error.message || "Something went wrong while processing payment. Please try again.",
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
                <div className="space-y-2">
                  <label htmlFor="pickupLocation" className="text-sm font-medium">
                    Pickup Location <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="pickupLocation"
                    placeholder="Enter pickup location"
                    required
                    value={bookingDetails.pickupLocation}
                    onChange={handleInputChange}
                  />
                  {formErrors.pickupLocation && (
                    <p className="text-red-500 text-sm">{formErrors.pickupLocation}</p>
                  )}
                </div>

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
                      onValueChange={handleSelectChange}
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
                    min={minDateTimeString} // Prevent selecting past dates
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
                <p><strong>Service Type:</strong> Hire By Hour</p>
                <p><strong>Duration:</strong> {bookingDetails.duration} {bookingDetails.durationUnit}</p>
                <p><strong>Pickup Location:</strong> {bookingDetails.pickupLocation}</p>
                <p><strong>Date & Time:</strong> {new Date(bookingDetails.dateTime).toLocaleString()}</p>
              </div>

              <h2 className="text-2xl font-bold mt-8">Available Vehicles</h2>
              <div className="space-y-6">
                {vehicles.map((vehicle) => (
                  <VehicleServiceCard
                    key={vehicle.id}
                    title={vehicle.title}
                    name={vehicle.name}
                    description={vehicle.description}
                    passengers={vehicle.passengers}
                    bags={vehicle.bags}
                    wifi={vehicle.wifi}
                    meetGreet={vehicle.meet_greet}
                    drinks={vehicle.drinks}
                    waitingTime={vehicle.waiting_time}
                    price={vehicle.price_per_hour}
                    selected={selectedVehicle === vehicle.id} 
                    onSelect={() => setSelectedVehicle(vehicle.id)}
                  />
                ))}
              </div>

              {selectedVehicle && (
                <Button
                  className="px-10 mt-6 float-right"
                  onClick={handlePayment}
                  disabled={isProcessing}
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
          )}
        </div>
      </section>
    </main>
  );
}