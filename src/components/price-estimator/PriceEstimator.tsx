"use client";
import { useState, useEffect, useMemo } from "react";
import { addDays, isWithinInterval, startOfDay } from "date-fns";
import { getFestivePeriods } from "./festive-periods";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JourneyForm from "./components/JourneyForm";
import PriceModal from "./components/PriceModal";
import { AlertCircle } from "lucide-react";
import type { Location, Vehicle } from "@/lib/types";
import { useRouter } from "next/navigation";

export interface BookingData {
  serviceType: string;
  dateTime: string;
  passengers: number;
  additionalServices: {
    buggy?: boolean;
    porter?: boolean;
    bags?: number;
  };
  flightDetails?: {
    arrival?: string;
    departure?: string;
  };
  estimatedPrice: number;
}

export function PriceEstimator() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationsLoading, setIsLocationsLoading] = useState(true);
  const [isVehiclesLoading, setIsVehiclesLoading] = useState(true);
  const [serviceType, setServiceType] = useState<
    "meetAndAssist" | "airportTransfer" | "hireByHour"
  >("meetAndAssist");
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [hour, setHour] = useState("14"); // 24-hour format
  const [minute, setMinute] = useState("00");
  const [passengers, setPassengers] = useState(1);
  const [wantBuggy, setWantBuggy] = useState(false);
  const [wantPorter, setWantPorter] = useState(false);
  const [bags, setBags] = useState(0);
  const [additionalHours, setAdditionalHours] = useState(0);
  const [meetAndAssistType, setMeetAndAssistType] = useState<
    "arrival" | "departure" | "connection"
  >("arrival");
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState<
    { description: string; amount: number }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [flightNumberArrival, setFlightNumberArrival] = useState("");
  const [flightNumberDeparture, setFlightNumberDeparture] = useState("");
  const [vehicle, setVehicle] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch locations and vehicles in parallel
        const [locationsResponse, vehiclesResponse] = await Promise.all([
          fetch('/api/locations').then(res => res.json()),
          fetch('/api/vehicles').then(res => res.json())
        ]);

        setLocations(locationsResponse);
        setVehicles(vehiclesResponse);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
        setIsLocationsLoading(false);
        setIsVehiclesLoading(false);
      }
    };

    fetchData();
  }, []);

  const currentYear = new Date().getFullYear();
  const FESTIVE_PERIODS = useMemo(
    () => getFestivePeriods(currentYear),
    [currentYear]
  );

  // Constants from environment variables
  const VAT_RATE = Number(process.env.NEXT_PUBLIC_VAT_RATE) || 0.20;
  const UNSOCIAL_HOURS_CHARGE = Number(process.env.NEXT_PUBLIC_UNSOCIAL_HOURS_CHARGE) || 60;
  const FESTIVE_MULTIPLIER = Number(process.env.NEXT_PUBLIC_FESTIVE_MULTIPLIER) || 2;
  const PORTER_RATE = Number(process.env.NEXT_PUBLIC_PORTER_RATE_PER_8_BAGS) || 65;
  const BUGGY_SERVICE_RATE = Number(process.env.NEXT_PUBLIC_BUGGY_SERVICE_RATE) || 80;
  const MEET_GREET_BASE_RATE = Number(process.env.NEXT_PUBLIC_MEET_GREET_BASE_RATE) || 140;
  const MEET_GREET_CONNECTION_RATE = Number(process.env.NEXT_PUBLIC_MEET_GREET_CONNECTION_RATE) || 280;
  const AIRPORT_TRANSFER_BASE_RATE = Number(process.env.NEXT_PUBLIC_AIRPORT_TRANSFER_BASE_RATE) || 100;

  const calculatePrice = () => {
    let basePrice = 0;
    const breakdown: { description: string; amount: number }[] = [];

    const selectedDateTime = date ? new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      parseInt(hour),
      parseInt(minute)
    ) : new Date();

    // Check if service time is during unsocial hours (22:00 - 06:00)
    const isUnsocialHours = selectedDateTime.getHours() >= 22 || selectedDateTime.getHours() < 6;

    // Check if service date falls within festive periods
    const isFestivePeriod = FESTIVE_PERIODS.some(period =>
      isWithinInterval(startOfDay(selectedDateTime), {
        start: startOfDay(new Date(period.start)),
        end: startOfDay(new Date(period.end))
      })
    );

    switch (serviceType) {
      case "meetAndAssist":
        basePrice = meetAndAssistType === "connection" 
          ? MEET_GREET_CONNECTION_RATE 
          : MEET_GREET_BASE_RATE;
        
        breakdown.push({ description: "Base Rate", amount: basePrice });

        if (wantBuggy) {
          breakdown.push({ description: "Buggy Service", amount: BUGGY_SERVICE_RATE });
          basePrice += BUGGY_SERVICE_RATE;
        }

        if (wantPorter) {
          const porterCount = Math.ceil(bags / 8);
          const porterCost = PORTER_RATE * porterCount;
          breakdown.push({ description: `Porter Service (${porterCount} porter${porterCount > 1 ? 's' : ''})`, amount: porterCost });
          basePrice += porterCost;
        }
        break;

      case "airportTransfer":
        basePrice = AIRPORT_TRANSFER_BASE_RATE;
        breakdown.push({ description: "Base Rate", amount: basePrice });
        break;

      case "hireByHour":
        const selectedVehicle = vehicles.find(v => v.id === vehicle);
        if (selectedVehicle) {
          basePrice = selectedVehicle.basePrice;
          breakdown.push({ description: "Base Rate", amount: basePrice });
        }
        break;
    }

    // Add unsocial hours charge if applicable
    if (isUnsocialHours) {
      breakdown.push({ description: "Unsocial Hours Charge", amount: UNSOCIAL_HOURS_CHARGE });
      basePrice += UNSOCIAL_HOURS_CHARGE;
    }

    // Apply festive period multiplier if applicable
    if (isFestivePeriod) {
      const festiveCharge = basePrice * (FESTIVE_MULTIPLIER - 1);
      breakdown.push({ description: "Festive Period Charge", amount: festiveCharge });
      basePrice += festiveCharge;
    }

    // Calculate VAT
    const vatAmount = basePrice * VAT_RATE;
    breakdown.push({ description: "VAT", amount: vatAmount });
    const totalPrice = basePrice + vatAmount;

    setEstimatedPrice(totalPrice);
    setPriceBreakdown(breakdown);
    setShowModal(true);
  };

  const handleContinueToBooking = () => {
    const bookingData: BookingData = {
      serviceType,
      dateTime: date ? new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parseInt(hour),
        parseInt(minute)
      ).toISOString() : new Date().toISOString(),
      passengers,
      additionalServices: {
        buggy: wantBuggy,
        porter: wantPorter,
        bags,
      },
      flightDetails: {
        arrival: flightNumberArrival,
        departure: flightNumberDeparture,
      },
      estimatedPrice,
    };

    // Store booking data in localStorage for the booking page
    localStorage.setItem('bookingData', JSON.stringify(bookingData));
    
    // Navigate to booking page
    router.push('/booking');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Price Estimator</CardTitle>
        <CardDescription>
          Calculate the estimated price for your journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <Tabs 
          defaultValue="meetAndAssist" 
          onValueChange={(value) => setServiceType(value as "meetAndAssist" | "airportTransfer" | "hireByHour")}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meetAndAssist">Meet & Assist</TabsTrigger>
            <TabsTrigger value="airportTransfer">Airport Transfer</TabsTrigger>
            <TabsTrigger value="hireByHour">Hire by Hour</TabsTrigger>
          </TabsList>
          <TabsContent value="meetAndAssist">
            <JourneyForm
              type="meetAndAssist"
              locations={locations}
              onCalculate={calculatePrice}
              formData={{
                date,
                hour,
                minute,
                meetAndAssistType,
                passengers,
                wantBuggy,
                wantPorter,
                bags,
                flightNumberArrival,
                flightNumberDeparture,
                additionalHours,
              }}
              setFormData={{
                setDate,
                setHour,
                setMinute,
                setMeetAndAssistType,
                setPassengers,
                setWantBuggy,
                setWantPorter,
                setBags,
                setFlightNumberArrival,
                setFlightNumberDeparture,
                setAdditionalHours,
              }}
              isLoading={isLocationsLoading}
            />
          </TabsContent>
          <TabsContent value="airportTransfer">
            <JourneyForm
              type="airportTransfer"
              locations={locations}
              onCalculate={calculatePrice}
              formData={{
                date,
                hour,
                minute,
                passengers,
                additionalHours,
              }}
              setFormData={{
                setDate,
                setHour,
                setMinute,
                setPassengers,
                setAdditionalHours,
              }}
              isLoading={isLocationsLoading}
            />
          </TabsContent>
          <TabsContent value="hireByHour">
            <JourneyForm
              type="hireByHour"
              locations={locations}
              vehicles={vehicles}
              onCalculate={calculatePrice}
              formData={{
                date,
                hour,
                minute,
                passengers,
                additionalHours,
                vehicle,
              }}
              setFormData={{
                setDate,
                setHour,
                setMinute,
                setPassengers,
                setAdditionalHours,
                setVehicle,
              }}
              isLoading={isLocationsLoading || isVehiclesLoading}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <PriceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onContinue={handleContinueToBooking}
        estimatedPrice={estimatedPrice}
        priceBreakdown={priceBreakdown}
      />
    </Card>
  );
}
