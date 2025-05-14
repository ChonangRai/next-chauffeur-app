"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format, addDays, isWithinInterval, startOfDay } from "date-fns";
import { getFestivePeriods } from "./festive-periods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import JourneyForm from "./components/JourneyForm";
import PriceModal from "./components/PriceModal";
import { supabase } from "@/lib/supabase";

export function PriceEstimator() {
  const [isLoading, setIsLoading] = useState(true);
  const [serviceType, setServiceType] = useState<"meetAndGreet" | "airportTransfer" | "dailyHire">("meetAndGreet");
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [hour, setHour] = useState("2");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("pm");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [vehicle, setVehicle] = useState("sedan");
  const [passengers, setPassengers] = useState(1);
  const [additionalHours, setAdditionalHours] = useState(0);
  const [wantBuggy, setWantBuggy] = useState(false);
  const [wantPorter, setWantPorter] = useState(false);
  const [bags, setBags] = useState(0);
  const [meetAndGreetType, setMeetAndGreetType] = useState<"arrival" | "departure" | "connection">("arrival");
  const [estimatedPrice, setEstimatedPrice] = useState("£0.00");
  const [priceBreakdown, setPriceBreakdown] = useState<string[]>([]);
  const [extraInfo, setExtraInfo] = useState<string[]>([]);
  const [isFestive, setIsFestive] = useState(false);
  const [festiveMessage, setFestiveMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [vatRate, setVatRate] = useState<number>(0.2);
  const [vehicleRates, setVehicleRates] = useState<Record<string, number>>({});
  const [airportTransferRate, setAirportTransferRate] = useState<number | null>(null);
  const [meetAndGreetRate, setMeetAndGreetRate] = useState({ arrivalDeparture: 140, connection: 280 });
  const [extraCharges, setExtraCharges] = useState({
    unsocial_hours: 60,
    festive_period_multiplier: 2,
    additional_hour: 50,
    porter_per_8_bags: 65,
    buggy: 80,
  });
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const FESTIVE_PERIODS = useMemo(() => getFestivePeriods(currentYear), [currentYear]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("name")
          .eq("status", "active")
          .order("name", { ascending: true });

        if (locationsError) throw locationsError;

        const locationNames = locationsData.map((loc) => loc.name);
        setLocations(locationNames);

        if (locationNames.length > 0 && !pickupLocation) {
          setPickupLocation(locationNames[0]);
        }

        const { data: vatData, error: vatError } = await supabase
          .from("config")
          .select("value")
          .eq("key", "vat_rate")
          .single();

        if (vatError) throw vatError;
        if (vatData) setVatRate(parseFloat(vatData.value) || 0.2);

        const { data: pricingData, error: pricingError } = await supabase
          .from("service_pricing")
          .select("service_type, value");

        if (pricingError) throw pricingError;
        if (pricingData) {
          const airportRate = pricingData.find((item) => item.service_type === "airport_transfer")?.value || 100;
          const meetGreetArrival = pricingData.find((item) => item.service_type === "meetAndGreet")?.value || 140;
          const meetGreetConnection = pricingData.find((item) => item.service_type === "meet_and_greet_connection")?.value || 280;

          setAirportTransferRate(airportRate);
          setMeetAndGreetRate({ arrivalDeparture: meetGreetArrival, connection: meetGreetConnection });
        }

        const { data: chargesData, error: chargesError } = await supabase
          .from("extra_charges")
          .select("charge_type, amount")
          .in("charge_type", [
            "unsocial_hours",
            "festive_period_multiplier",
            "additional_hour",
            "porter_per_8_bags",
            "buggy",
          ]);

        if (chargesError) throw chargesError;
        if (chargesData) {
          const chargesMap = chargesData.reduce((acc, { charge_type, amount }) => {
            acc[charge_type] = parseFloat(amount) || 0;
            return acc;
          }, {} as Record<string, number>);

          setExtraCharges({
            unsocial_hours: chargesMap["unsocial_hours"] || 60,
            festive_period_multiplier: chargesMap["festive_period_multiplier"] || 2,
            additional_hour: chargesMap["additional_hour"] || 50,
            porter_per_8_bags: chargesMap["porter_per_8_bags"] || 65,
            buggy: chargesMap["buggy"] || 80,
          });
        }

        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("vehicle_type, base_price");

        if (vehiclesError) throw vehiclesError;
        if (vehiclesData) {
          const rates = vehiclesData.reduce((acc, { vehicle_type, base_price }) => {
            acc[vehicle_type] = base_price;
            return acc;
          }, {} as Record<string, number>);

          setVehicleRates(rates);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!date) return;

    const bookingDate = startOfDay(date);
    const festivePeriod = FESTIVE_PERIODS.find((period) => {
      const start = startOfDay(period.start);
      const end = startOfDay(period.end);
      return isWithinInterval(bookingDate, { start, end });
    });

    setIsFestive(!!festivePeriod);
    setFestiveMessage(festivePeriod ? `${festivePeriod.name}: Price doubled during festive period` : "");
  }, [date, FESTIVE_PERIODS]);

  useEffect(() => {
    if (!hour || !period) return;

    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));
    const hasUnsocialHours = hour24 >= 22 || hour24 < 6;
    const unsocialMessage = hasUnsocialHours
      ? `Unsolicited Hours (22:00-06:00): Additional £${extraCharges.unsocial_hours} + VAT applies`
      : "";

    setExtraInfo((prev) => {
      const otherMessages = prev.filter((msg) => !msg.includes("Unsolicited Hours"));
      return hasUnsocialHours ? [...otherMessages, unsocialMessage] : otherMessages;
    });
  }, [hour, period, extraCharges.unsocial_hours]);

  useEffect(() => {
    if (!festiveMessage) return;

    setExtraInfo((prev) => {
      const otherMessages = prev.filter((msg) => !msg.includes("festive period"));
      return festiveMessage ? [...otherMessages, festiveMessage] : otherMessages;
    });
  }, [festiveMessage]);

  const calculatePrice = useCallback((): number => {
    if (!date || !hour || !minute || !period) return 0;

    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));
    const breakdown: string[] = [];
    const festiveMultiplier = isFestive ? extraCharges.festive_period_multiplier : 1;
    const unsocialCharge = hour24 >= 22 || hour24 < 6 ? extraCharges.unsocial_hours : 0;

    let basePrice = 0;

    switch (serviceType) {
      case "meetAndGreet":
        basePrice = meetAndGreetType === "connection" ? meetAndGreetRate.connection : meetAndGreetRate.arrivalDeparture;
        breakdown.push(`Base Price (${meetAndGreetType}): £${basePrice}`);

        const additionalPassengers = Math.max(0, passengers - 2);
        if (additionalPassengers > 0) {
          const additionalPassengerCost = additionalPassengers * 45;
          breakdown.push(`Additional Passengers (${additionalPassengers}): £${additionalPassengerCost}`);
          basePrice += additionalPassengerCost;
        }

        if (additionalHours > 0) {
          const additionalHoursCost = additionalHours * extraCharges.additional_hour;
          breakdown.push(`Additional Hours (${additionalHours}): £${additionalHoursCost}`);
          basePrice += additionalHoursCost;
        }

        if (wantBuggy) {
          breakdown.push(`Buggy: £${extraCharges.buggy}`);
          basePrice += extraCharges.buggy;
        }

        if (bags > 0) {
          const porterBags = Math.ceil(bags / 8) * extraCharges.porter_per_8_bags;
          breakdown.push(`Porter (${bags} bags): £${porterBags}`);
          basePrice += porterBags;
        }
        break;

      case "airportTransfer":
        if (airportTransferRate) {
          basePrice = airportTransferRate;
          breakdown.push(`Base Price (Airport Transfer): £${basePrice}`);
        }
        break;

      case "dailyHire":
        const hourlyRate = vehicleRates[vehicle] || 0;
        if (hourlyRate) {
          basePrice = hourlyRate * additionalHours;
          breakdown.push(`Hourly Rate (${vehicle}): £${hourlyRate}/hour`);
          breakdown.push(`Hours (${additionalHours}): £${basePrice}`);
        }
        break;
    }

    if (isFestive && basePrice > 0) {
      const originalBase = basePrice;
      basePrice *= festiveMultiplier;
      breakdown.push(`Festive Period (x${festiveMultiplier}): £${originalBase} → £${basePrice}`);
    }

    if (unsocialCharge && basePrice > 0) {
      basePrice += unsocialCharge;
      breakdown.push(`Unsolicited Hours Fee: £${unsocialCharge}`);
    }

    if (basePrice > 0) {
      const vatAmount = basePrice * vatRate;
      breakdown.push(`VAT (${(vatRate * 100).toFixed(1)}%): £${vatAmount.toFixed(2)}`);
      basePrice += vatAmount;
    }

    breakdown.push(`Total: £${basePrice.toFixed(2)}`);
    setPriceBreakdown(breakdown);
    return basePrice;
  }, [
    date,
    hour,
    minute,
    period,
    isFestive,
    serviceType,
    meetAndGreetType,
    passengers,
    additionalHours,
    wantBuggy,
    bags,
    vehicle,
    vatRate,
    vehicleRates,
    airportTransferRate,
    meetAndGreetRate,
    extraCharges,
  ]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const price = calculatePrice();
    setEstimatedPrice(`£${price.toFixed(2)}`);
    setShowModal(true);
  }, [calculatePrice]);

  const handleContinueToBooking = useCallback(() => {
    if (!date) return;

    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));
    const dateTime = new Date(`${format(date, "yyyy-MM-dd")}T${hour24.toString().padStart(2, "0")}:${minute}:00`).toISOString();

    const params = new URLSearchParams({
      serviceType,
      dateTime,
      pickupLocation,
      passengers: passengers.toString(),
      additionalHours: additionalHours.toString(),
      wantBuggy: wantBuggy.toString(),
      wantPorter: wantPorter.toString(),
      bags: bags.toString(),
      ...(serviceType === "meetAndGreet" && { meetAndGreetType }),
      estimatedPrice: estimatedPrice,
      fromEstimator: "true",
    });

    window.location.href = `/booking?${params.toString()}`;
  }, [
    date,
    hour,
    minute,
    period,
    serviceType,
    pickupLocation,
    passengers,
    additionalHours,
    wantBuggy,
    wantPorter,
    bags,
    meetAndGreetType,
    estimatedPrice,
  ]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimate Your Journey</CardTitle>
        <CardDescription>Fill in the details below to get an estimated price for your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
        )}
        
        <Tabs 
          value={serviceType} 
          onValueChange={(value) => setServiceType(value as "meetAndGreet" | "airportTransfer" | "dailyHire")} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meetAndGreet">Meet and Greet</TabsTrigger>
            <TabsTrigger value="airportTransfer">Airport Transfer</TabsTrigger>
            <TabsTrigger value="dailyHire">Daily Hire</TabsTrigger>
          </TabsList>
          
          {["meetAndGreet", "airportTransfer", "dailyHire"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <JourneyForm
                serviceType={serviceType}
                step="estimate"
                date={date}
                setDate={setDate}
                hour={hour}
                setHour={setHour}
                minute={minute}
                setMinute={setMinute}
                period={period}
                setPeriod={setPeriod}
                pickupLocation={pickupLocation}
                setPickupLocation={setPickupLocation}
                dropoffLocation={dropoffLocation}
                setDropoffLocation={setDropoffLocation}
                vehicle={vehicle}
                setVehicle={setVehicle}
                passengers={passengers}
                setPassengers={setPassengers}
                additionalHours={additionalHours}
                setAdditionalHours={setAdditionalHours}
                wantBuggy={wantBuggy}
                setWantBuggy={setWantBuggy}
                wantPorter={wantPorter}
                setWantPorter={setWantPorter}
                bags={bags}
                setBags={setBags}
                meetAndGreetType={meetAndGreetType}
                setMeetAndGreetType={setMeetAndGreetType}
                festiveMessage={festiveMessage}
                extraInfo={extraInfo}
                handleSubmit={handleSubmit}
                locations={locations}
                fullName=""
                setFullName={() => {}}
                email=""
                setEmail={() => {}}
                phone=""
                setPhone={() => {}}
                additionalRequests=""
                setAdditionalRequests={() => {}}
                contactConsent={false}
                setContactConsent={() => {}}
                calculatedAmount={null}
              />
            </TabsContent>
          ))}
        </Tabs>
        
        <PriceModal
          showModal={showModal}
          setShowModal={setShowModal}
          estimatedPrice={estimatedPrice}
          priceBreakdown={priceBreakdown}
          onContinue={handleContinueToBooking}
        />
      </CardContent>
    </Card>
  );
}