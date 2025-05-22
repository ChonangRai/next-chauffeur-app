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
  const [dropoffLocationId, setDropoffLocationId] = useState<string>("");
  const [extraCharges, setExtraCharges] = useState<Record<string, any>>({});
  const [serviceRates, setServiceRates] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch locations, vehicles, and service rates in parallel
        const [locationsResponse, vehiclesResponse, serviceRatesSnap, extraChargesSnap] = await Promise.all([
          fetch('/api/locations').then(res => res.json()),
          fetch('/api/vehicles').then(res => res.json()),
          getDocs(collection(db, "service_rates")),
          getDocs(collection(db, "extra_charges")),
        ]);
        setLocations(locationsResponse);
        setVehicles(vehiclesResponse);
        
        // Map service rates by id
        const rates: Record<string, any> = {};
        serviceRatesSnap.forEach(doc => {
          rates[doc.id] = doc.data();
        });
        setServiceRates(rates);

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
    let surcharges = 0;
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

    // Calculate base price
    switch (serviceType) {
      case "meetAndGreet":
        if (serviceSubType === "connection" && pickupLocationId && dropoffLocationId) {
          const pickup = locations.find(l => l.id === pickupLocationId);
          const dropoff = locations.find(l => l.id === dropoffLocationId);
          if (pickup && dropoff) {
            const pickupTerminal = pickup.name.trim().toLowerCase();
            const dropoffTerminal = dropoff.name.trim().toLowerCase();
            if (pickupTerminal === dropoffTerminal) {
              basePrice = serviceRates["meet-assist-base"]?.baseRate || 140;
              breakdown.push({ description: "Base Rate (Same Terminal, 2 hours, up to 2 passengers)", amount: basePrice });
            } else {
              basePrice = serviceRates["meet-assist-connection"]?.baseRate || 180;
              breakdown.push({ description: "Base Rate (Different Terminals, 2 hours, up to 2 passengers)", amount: basePrice });
            }
          } else {
            basePrice = serviceRates["meet-assist-base"]?.baseRate || 140;
            breakdown.push({ description: "Base Rate (2 hours, up to 2 passengers)", amount: basePrice });
          }
        } else {
          basePrice = serviceRates["meet-assist-base"]?.baseRate || 140;
          breakdown.push({ description: "Base Rate (2 hours, up to 2 passengers)", amount: basePrice });
        }

        // Apply festive period multiplier to base price if applicable
        if (isFestivePeriod) {
          const multiplier = extraCharges["festive-multiplier"]?.amount || 2;
          const festiveCharge = basePrice * (multiplier - 1);
          breakdown.push({ description: `Festive Period Surcharge (${multiplier}x base rate)`, amount: festiveCharge });
          basePrice = basePrice * multiplier;
        }

        // Calculate additional charges
        // Additional hours charge
        const additionalHourRate = extraCharges["additional-hour"]?.amount || 0;
        const additionalHoursCharge = additionalHours * additionalHourRate;
        if (additionalHours > 0) {
          breakdown.push({ description: `Additional Hours (${additionalHours} hours)`, amount: additionalHoursCharge });
          surcharges += additionalHoursCharge;
        }

        // Additional passengers charge
        if (passengers > 2) {
          const additionalPassengerRate = extraCharges["additional-passenger"]?.amount || 0;
          const additionalPassengers = passengers - 2;
          const additionalPassengersCharge = additionalPassengers * additionalPassengerRate;
          breakdown.push({ description: `Additional Passengers (${additionalPassengers})`, amount: additionalPassengersCharge });
          surcharges += additionalPassengersCharge;
        }

        // Buggy service
        if (wantBuggy) {
          const buggyRate = extraCharges["buggy-service"]?.amount || 0;
          breakdown.push({ description: "Buggy Service", amount: buggyRate });
          surcharges += buggyRate;
        }

        // Porter service
        if (wantPorter && bags) {
          const porterRate = extraCharges["porter-service"]?.amount || 0;
          const porterCount = Math.ceil(bags / 8);
          const porterCost = porterCount * porterRate;
          breakdown.push({ description: `Porter Service (${porterCount} porter${porterCount > 1 ? 's' : ''})`, amount: porterCost });
          surcharges += porterCost;
        }
        break;

      case "airportTransfer":
        basePrice = serviceRates["airport-transfer-base-rate"]?.amount || 100;
        breakdown.push({ description: "Base Rate", amount: basePrice });

        // Apply festive period multiplier to base price if applicable
        if (isFestivePeriod) {
          const multiplier = extraCharges["festive-multiplier"]?.amount || 2;
          const festiveCharge = basePrice * (multiplier - 1);
          breakdown.push({ description: `Festive Period Surcharge (${multiplier}x base rate)`, amount: festiveCharge });
          basePrice = basePrice * multiplier;
        }
        break;

      case "hourlyHire":
        const selectedVehicle = vehicles.find(v => v.id === vehicle);
        if (selectedVehicle) {
          basePrice = selectedVehicle.basePrice;
          breakdown.push({ description: "Base Rate", amount: basePrice });

          // Apply festive period multiplier to base price if applicable
          if (isFestivePeriod) {
            const multiplier = extraCharges["festive-multiplier"]?.amount || 2;
            const festiveCharge = basePrice * (multiplier - 1);
            breakdown.push({ description: `Festive Period Surcharge (${multiplier}x base rate)`, amount: festiveCharge });
            basePrice = basePrice * multiplier;
          }
        }
        break;
    }

    // Add subtotal before unsocial hours
    // const subtotalBeforeUnsocial = basePrice + surcharges;
    // breakdown.push({ description: "Subtotal (before unsocial hours)", amount: subtotalBeforeUnsocial });

    // Unsocial hours surcharge (applied after festive period but before VAT)
    if (isUnsocialHours) {
      const unsocialHoursRate = extraCharges["unsocial-hours"]?.amount || 0;
      breakdown.push({ description: "Unsocial Hours Surcharge", amount: unsocialHoursRate });
      surcharges += unsocialHoursRate;
    }

    // Calculate total before VAT
    const totalBeforeVat = basePrice + surcharges;
    breakdown.push({ description: "Total (before VAT)", amount: totalBeforeVat });

    // VAT calculation
    const vatRate = extraCharges["vat-rate"]?.amount/100 || 0.2;
    const vatAmount = totalBeforeVat * vatRate;
    breakdown.push({ description: `VAT (${(vatRate * 100).toFixed(0)}%)`, amount: vatAmount });

    // Final total
    const totalPrice = totalBeforeVat + vatAmount;
    setEstimatedPrice(totalPrice);
    setPriceBreakdown(breakdown);
    setShowModal(true);
  };

  const handleContinueToBooking = () => {
    const serviceDetails = {
      service_type: serviceType,
      service_subtype: serviceSubType,
      pickupLocationId,
      dropoffLocationId,
      date: date?.toISOString(),
      hour,
      minute,
      passengers,
      wantBuggy,
      wantPorter,
      bags,
      flightNumberArrival,
      flightNumberDeparture,
      additionalHours,
      vehicle,
      estimatedPrice,
      priceBreakdown,
      // Add all other relevant details
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
                dropoffLocationId,
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
                setDropoffLocationId,
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
