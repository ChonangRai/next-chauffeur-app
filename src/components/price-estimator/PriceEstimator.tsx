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
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BookingData {
  serviceType: string;
  dateTime: string;
  passengers: number;
  locationId: string;
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
    "meetAndGreet" | "airportTransfer" | "hourlyHire"
  >("meetAndGreet");
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [hour, setHour] = useState("14"); // 24-hour format
  const [minute, setMinute] = useState("00");
  const [passengers, setPassengers] = useState(1);
  const [wantBuggy, setWantBuggy] = useState(false);
  const [wantPorter, setWantPorter] = useState(false);
  const [bags, setBags] = useState(0);
  const [additionalHours, setAdditionalHours] = useState(0);
  const [serviceSubType, setServiceSubType] = useState<
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
  const [pickupLocationId, setPickupLocationId] = useState<string>("");
  const [extraCharges, setExtraCharges] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch locations and vehicles in parallel
        const [locationsResponse, vehiclesResponse, extraChargesSnap] = await Promise.all([
          fetch('/api/locations').then(res => res.json()),
          fetch('/api/vehicles').then(res => res.json()),
          getDocs(collection(db, "extra_charges")),
        ]);
        setLocations(locationsResponse);
        setVehicles(vehiclesResponse);
        // Map extra charges by id
        const charges: Record<string, any> = {};
        extraChargesSnap.forEach(doc => {
          charges[doc.id] = doc.data();
        });
        setExtraCharges(charges);
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
      case "meetAndGreet":
        basePrice = 140; // fallback
        if (extraCharges["meet-greet-base-rate"]?.amount) basePrice = extraCharges["meet-greet-base-rate"].amount;
        breakdown.push({ description: "Base Rate (2 hours, up to 2 passengers)", amount: basePrice });
        // Additional hours charge
        const rate = extraCharges["additional-hour"]?.amount || 0;
        const additionalHoursCharge = additionalHours * rate;
        if (additionalHours > 0) {
          breakdown.push({ description: `Additional Hours (${additionalHours} hours)`, amount: additionalHoursCharge });
          basePrice += additionalHoursCharge;
        }
        // Additional passengers charge
        if (passengers > 2) {
          const rate = extraCharges["additional-passenger"]?.amount || 0;
          const additionalPassengers = passengers - 2;
          const additionalPassengersCharge = additionalPassengers * rate;
          breakdown.push({ description: `Additional Passengers (${additionalPassengers})`, amount: additionalPassengersCharge });
          basePrice += additionalPassengersCharge;
        }
        // Buggy service
        if (wantBuggy) {
          const rate = extraCharges["buggy-service"]?.amount || 0;
          breakdown.push({ description: "Buggy Service", amount: rate });
          basePrice += rate;
        }
        // Porter service
        if (wantPorter && bags) {
          const rate = extraCharges["porter-service"]?.amount || 0;
          const porterCount = Math.ceil(bags / 8);
          const porterCost = porterCount * rate;
          breakdown.push({ description: `Porter Service (${porterCount} porter${porterCount > 1 ? 's' : ''})`, amount: porterCost });
          basePrice += porterCost;
        }
        break;

      case "airportTransfer":
        basePrice = extraCharges["airport-transfer-base-rate"]?.amount || 100;
        breakdown.push({ description: "Base Rate", amount: basePrice });
        break;

      case "hourlyHire":
        const selectedVehicle = vehicles.find(v => v.id === vehicle);
        if (selectedVehicle) {
          basePrice = selectedVehicle.basePrice;
          breakdown.push({ description: "Base Rate", amount: basePrice });
        }
        break;
    }

    // Unsocial hours
    if (isUnsocialHours) {
      const rate = extraCharges["unsocial-hours"]?.amount || 0;
      breakdown.push({ description: "Unsocial Hours Charge", amount: rate });
      basePrice += rate;
    }

    // Festive period
    if (isFestivePeriod) {
      const multiplier = extraCharges["festive-multiplier"]?.amount || 2;
      const festiveCharge = basePrice;
      breakdown.push({ description: `Festive Period Charge (x${multiplier})`, amount: festiveCharge });
      basePrice *= multiplier;
    }

    // VAT
    const vatRate = extraCharges["vat-rate"]?.amount || 0.2;
    const vatAmount = basePrice * vatRate;
    breakdown.push({ description: "VAT", amount: vatAmount });
    const totalPrice = basePrice + vatAmount;
    setEstimatedPrice(totalPrice);
    setPriceBreakdown(breakdown);
    setShowModal(true);
  };

  const handleContinueToBooking = () => {
    const serviceDetails = {
      serviceType,
      dateTime: date ? new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        parseInt(hour),
        parseInt(minute)
      ).toISOString() : new Date().toISOString(),
      passengers,
      locationId: pickupLocationId,
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
      priceBreakdown,
      // Add all other relevant details
      serviceSubType,
      additionalHours,
      vehicle,
      hour,
      minute,
      date: date?.toISOString(),
    };

    // Store service details in localStorage
    localStorage.setItem('serviceDetails', JSON.stringify(serviceDetails));
    
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
          defaultValue="meetAndGreet" 
          onValueChange={(value) => setServiceType(value as "meetAndGreet" | "airportTransfer" | "hourlyHire")}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meetAndGreet">Meet & Greet</TabsTrigger>
            <TabsTrigger value="airportTransfer">Airport Transfer</TabsTrigger>
            <TabsTrigger value="hourlyHire">Hire by Hour</TabsTrigger>
          </TabsList>
          <TabsContent value="meetAndGreet">
            <JourneyForm
              type="meetAndGreet"
              locations={locations}
              onCalculate={calculatePrice}
              formData={{
                date,
                hour,
                minute,
                service_subtype: serviceSubType,
                passengers,
                wantBuggy,
                wantPorter,
                bags,
                flightNumberArrival,
                flightNumberDeparture,
                additionalHours,
                pickupLocationId,
              }}
              setFormData={{
                setDate,
                setHour,
                setMinute,
                setServiceSubType,
                setPassengers,
                setWantBuggy,
                setWantPorter,
                setBags,
                setFlightNumberArrival,
                setFlightNumberDeparture,
                setAdditionalHours,
                setPickupLocationId,
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
                pickupLocationId,
              }}
              setFormData={{
                setDate,
                setHour,
                setMinute,
                setPassengers,
                setAdditionalHours,
                setPickupLocationId,
              }}
              isLoading={isLocationsLoading}
            />
          </TabsContent>
          <TabsContent value="hourlyHire">
            <JourneyForm
              type="hourlyHire"
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
                pickupLocationId,
              }}
              setFormData={{
                setDate,
                setHour,
                setMinute,
                setPassengers,
                setAdditionalHours,
                setVehicle,
                setPickupLocationId,
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
