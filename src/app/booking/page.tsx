"use client";
import { useEffect, useState } from "react";
import CarServiceCard from "@/components/car/car";
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
  const [isHireByHour, setIsHireByHour] = useState(false);
  const [showCars, setShowCars] = useState(false);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
    isHireByHour: false,
    contactConsent: false,
  });

  // Get the current date and time for the min attribute (in the format required by datetime-local)
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 5 * 60 * 1000); // Add 5 minutes buffer
  const minDateTimeString = minDateTime
    .toISOString()
    .slice(0, 16); // Format as YYYY-MM-DDTHH:mm

  useEffect(() => {
    const savedDetails = localStorage.getItem("bookingDetails");
    if (savedDetails) {
      const parsedDetails = JSON.parse(savedDetails);
      setBookingDetails(parsedDetails);
      setIsHireByHour(parsedDetails.isHireByHour);
      setShowCars(true);
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
    if (!isHireByHour && !bookingDetails.dropoffLocation)
      errors.dropoffLocation = "Drop-off location is required";
    if (isHireByHour && bookingDetails.duration < 1)
      errors.duration = "Duration must be at least 1";
    if (!bookingDetails.dateTime)
      errors.dateTime = "Date and time is required";
    else if (new Date(bookingDetails.dateTime) < bufferTime)
      errors.dateTime = "Date/time must be at least 5 minutes in the future";
    if (!bookingDetails.fullName) errors.fullName = "Full name is required";
    if (!bookingDetails.email) errors.email = "Email is required";
    if (!bookingDetails.phone) errors.phone = "Phone is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
      setShowCars(true);
    }
  };

  const handleReset = () => {
    localStorage.removeItem("bookingDetails");
    setShowCars(false);
    setSelectedCar(null);
    setFormErrors({});
    setPaymentError(null);
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
      isHireByHour: false,
      contactConsent: false,
    });
    setIsHireByHour(false);
  };

  const handlePayment = async () => {
    if (!selectedCar || isProcessing) return;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const basePrices = {
        "e-class": 180,
        "s-class": 250,
      } as const;

      const price = basePrices[selectedCar as keyof typeof basePrices];
      const hoursMultiplier =
        bookingDetails.durationUnit === "days" ? 24 : 1;
      const amount = isHireByHour
        ? price * bookingDetails.duration * hoursMultiplier
        : price;

      // Log the data being sent to /api/checkout
      console.log("Sending to /api/checkout:", {
        bookingDetails: {
          ...bookingDetails,
          selectedCar:
            selectedCar === "e-class"
              ? "Mercedes-Benz E-Class"
              : "Mercedes-Benz S-Class",
        },
        amount,
      });

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingDetails: {
            ...bookingDetails,
            selectedCar:
              selectedCar === "e-class"
              ? "Mercedes-Benz E-Class"
              : "Mercedes-Benz S-Class",
          },
          amount,
        }),
      });

      if (!response.ok) throw new Error("Failed to process payment");

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("Something went wrong while processing payment. Please try again.");
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
          {!showCars ? (
            <div className="bg-muted p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Enter Your Journey Details</h2>
              <form onSubmit={handleContinue} className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <Button
                    variant={isHireByHour ? "outline" : "default"}
                    onClick={() => {
                      setIsHireByHour(false);
                      setBookingDetails((prev) => ({
                        ...prev,
                        isHireByHour: false,
                        dropoffLocation: prev.dropoffLocation || "",
                      }));
                    }}
                    className="w-1/2"
                    type="button"
                  >
                    One Way
                  </Button>
                  <Button
                    variant={isHireByHour ? "default" : "outline"}
                    onClick={() => {
                      setIsHireByHour(true);
                      setBookingDetails((prev) => ({
                        ...prev,
                        isHireByHour: true,
                        dropoffLocation: "",
                      }));
                    }}
                    className="w-1/2"
                    type="button"
                  >
                    Hire By Hour
                  </Button>
                </div>

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
                  {isHireByHour ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <label htmlFor="dropoffLocation" className="text-sm font-medium">
                        Drop-off Location <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="dropoffLocation"
                        placeholder="Enter drop-off location"
                        required
                        value={bookingDetails.dropoffLocation}
                        onChange={handleInputChange}
                      />
                      {formErrors.dropoffLocation && (
                        <p className="text-red-500 text-sm">{formErrors.dropoffLocation}</p>
                      )}
                    </>
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
                <p><strong>Service Type:</strong> {isHireByHour ? "Hire By Hour" : "One Way"}</p>
              </div>

              <h2 className="text-2xl font-bold mt-8">Available Vehicles</h2>
              <div className="space-y-6">
                <CarServiceCard
                  title="BUSINESS CLASS"
                  name="MERCEDES-BENZ E-CLASS"
                  description="The Mercedes E-Class offers the perfect balance of luxury and practicality. Enjoy premium comfort with business-class features ideal for professional travel."
                  passengers={3}
                  bags={2}
                  wifi={true}
                  meetGreet={true}
                  waitingTime="45 minutes"
                  price={180}
                  selected={selectedCar === "e-class"}
                  onSelect={() => setSelectedCar("e-class")}
                />
                <CarServiceCard
                  title="LUXURY FIRST"
                  name="MERCEDES-BENZ S-CLASS"
                  description="The flagship S-Class represents the pinnacle of automotive luxury. Experience first-class travel with exceptional comfort and advanced features."
                  passengers={3}
                  bags={3}
                  wifi={true}
                  meetGreet={true}
                  drinks={true}
                  waitingTime="60 minutes"
                  price={250}
                  selected={selectedCar === "s-class"}
                  onSelect={() => setSelectedCar("s-class")}
                />
              </div>

              {paymentError && (
                <p className="text-red-600 text-center mt-4">{paymentError}</p>
              )}

              {selectedCar && (
                <Button
                  className="w-full mt-6"
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