import { useState } from "react";
import JourneyForm from "../price-estimator/components/JourneyForm";
import type { Location, Vehicle } from "@/types";

interface BookingFormProps {
  initialValues: any;
  serviceType: "meetAndGreet" | "airportTransfer" | "hourlyHire";
  locations: Location[];
  vehicles?: Vehicle[];
  onSubmit: (values: any) => void;
}

export default function BookingForm({
  initialValues,
  serviceType,
  locations,
  vehicles = [],
  onSubmit,
}: BookingFormProps) {
  // Set up state for all form fields, initialized from initialValues
  const [formData, setFormDataState] = useState({
    ...initialValues,
  });

  // Helper to update formData
  const setFormData = {
    setDate: (date: Date | undefined) => setFormDataState((prev: any) => ({ ...prev, date })),
    setHour: (hour: string) => setFormDataState((prev: any) => ({ ...prev, hour })),
    setMinute: (minute: string) => setFormDataState((prev: any) => ({ ...prev, minute })),
    setServiceSubType: (type: any) => setFormDataState((prev: any) => ({ ...prev, service_subtype: type })),
    setPassengers: (passengers: number) => setFormDataState((prev: any) => ({ ...prev, passengers })),
    setWantBuggy: (want: boolean) => setFormDataState((prev: any) => ({ ...prev, wantBuggy: want })),
    setWantPorter: (want: boolean) => setFormDataState((prev: any) => ({ ...prev, wantPorter: want })),
    setBags: (bags: number) => setFormDataState((prev: any) => ({ ...prev, bags })),
    setFlightNumberArrival: (flight: string) => setFormDataState((prev: any) => ({ ...prev, flightNumberArrival: flight })),
    setFlightNumberDeparture: (flight: string) => setFormDataState((prev: any) => ({ ...prev, flightNumberDeparture: flight })),
    setAdditionalHours: (hours: number) => setFormDataState((prev: any) => ({ ...prev, additionalHours: hours })),
    setVehicle: (vehicle: string) => setFormDataState((prev: any) => ({ ...prev, vehicle })),
    setPickupLocationId: (id: string) => setFormDataState((prev: any) => ({ ...prev, pickupLocationId: id })),
    setDropoffLocationId: (id: string) => setFormDataState((prev: any) => ({ ...prev, dropoffLocationId: id })),
    setCustomPickupAddress: (address: string) => setFormDataState((prev: any) => ({ ...prev, customPickupAddress: address })),
    setCustomDropoffAddress: (address: string) => setFormDataState((prev: any) => ({ ...prev, customDropoffAddress: address })),
  };

  // Only pass relevant fields to JourneyForm based on serviceType
  let filteredVehicles = vehicles;
  if (serviceType === "meetAndGreet") {
    filteredVehicles = [];
  }

  // Hide buggy/porter for airport transfer and hire by hour
  const hideBuggyPorter = serviceType !== "meetAndGreet";

  // Only show vehicle selection for airportTransfer and hourlyHire
  const showVehicle = serviceType === "airportTransfer" || serviceType === "hourlyHire";

  return (
    <JourneyForm
      type={serviceType}
      locations={locations}
      vehicles={showVehicle ? filteredVehicles : []}
      onCalculate={() => onSubmit(formData)}
      submitButtonText="Calculate Estimate"
      isLoading={false}
      formData={formData}
      setFormData={setFormData}
      // Pass only the relevant props for buggy/porter, etc.
      {...(hideBuggyPorter && {
        setWantBuggy: undefined,
        setWantPorter: undefined,
      })}
      // You can further customize which fields to show/hide here
    />
  );
} 