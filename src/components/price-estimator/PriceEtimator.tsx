import { useState, useEffect, useMemo, useCallback } from "react";
import { format, addDays, isWithinInterval, startOfDay } from "date-fns";
import { getFestivePeriods } from "./festive-periods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ServiceTypeSelector from "./components/ServiceTypeSelector";
import JourneyForm from "./components/JourneyForm";
import PriceModal from "./components/PriceModal";
import { supabase } from "@/lib/supabase";

const PREDEFINED_LOCATIONS = [
  "Heathrow Airport Terminal 2",
  "Heathrow Airport Terminal 3",
  "Heathrow Airport Terminal 4",
  "Heathrow Airport Terminal 5",
  "Gatwick Airport North Terminal",
  "Gatwick Airport South Terminal",
  "Luton Airport",
  "London City Airport",
  "Southend Airport"
];

const calculateMockDistance = (pickup: string, dropoff: string): number => {
  const normalizedPickup = pickup.toLowerCase();
  const normalizedDropoff = dropoff.toLowerCase();
  const distanceMap: Record<string, Record<string, number>> = {
    "gatwick airport north terminal": { "london city airport": 30 },
    "gatwick airport south terminal": { "london city airport": 30 },
    "luton airport": { "london city airport": 35 },
    "heathrow airport terminal 5": { "london city airport": 20 },
  };
  if (normalizedPickup === normalizedDropoff) return 0;
  return distanceMap[normalizedPickup]?.[normalizedDropoff] || 50;
};

export function PriceEstimator() {
  const [serviceType, setServiceType] = useState("meetAndGreet");
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [hour, setHour] = useState("2");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("pm");
  const [pickupLocation, setPickupLocation] = useState("Heathrow Airport Terminal 5");
  const [dropoffLocation, setDropoffLocation] = useState("London City Airport");
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
  const currentYear = new Date().getFullYear();
  
  // Memoize festive periods to prevent recreation on every render
  const FESTIVE_PERIODS = useMemo(() => getFestivePeriods(currentYear), [currentYear]);

  // Calculate festive period and unsocial hours separately to prevent unnecessary updates
  useEffect(() => {
    if (!date) return;

    const bookingDate = startOfDay(date);
    const festivePeriod = FESTIVE_PERIODS.find(period => {
      const start = startOfDay(period.start);
      const end = startOfDay(period.end);
      return isWithinInterval(bookingDate, { start, end });
    });

    const newIsFestive = !!festivePeriod;
    const newFestiveMessage = festivePeriod 
      ? `${festivePeriod.name}: Price doubled during festive period`
      : "";

    if (isFestive !== newIsFestive) {
      setIsFestive(newIsFestive);
    }

    if (festiveMessage !== newFestiveMessage) {
      setFestiveMessage(newFestiveMessage);
    }
  }, [date, FESTIVE_PERIODS, isFestive, festiveMessage]);

  // Handle unsocial hours calculation separately
  useEffect(() => {
    if (!hour || !period) return;

    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));

    const hasUnsocialHours = hour24 >= 22 || hour24 < 6;
    const unsocialMessage = hasUnsocialHours
      ? "Unsolicited Hours (22:00-06:00): Additional £60 + VAT applies"
      : "";

    setExtraInfo(prev => {
      // Remove any existing unsocial message
      const otherMessages = prev.filter(msg => !msg.includes("Unsolicited Hours"));
      // Add current message if needed
      if (hasUnsocialHours) {
        return [...otherMessages, unsocialMessage];
      }
      return otherMessages;
    });
  }, [hour, period]);

  // Add festive message to extra info when it changes
  useEffect(() => {
    if (!festiveMessage) return;

    setExtraInfo(prev => {
      // Remove any existing festive message
      const otherMessages = prev.filter(msg => !msg.includes("festive period"));
      // Add current message if it exists
      if (festiveMessage) {
        return [...otherMessages, festiveMessage];
      }
      return otherMessages;
    });
  }, [festiveMessage]);

  const calculatePrice = useCallback((): number => {
    if (!date || !hour || !minute || !period) return 0;

    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));

    const breakdown: string[] = [];
    const festiveMultiplier = isFestive ? 2 : 1;
    const unsocialCharge = (hour24 >= 22 || hour24 < 6) ? 60 : 0;

    let basePrice = 0;
    const vatRate = 0.2;

    switch (serviceType) {
      case "meetAndGreet":
        basePrice = meetAndGreetType === "connection" ? 280 : 140;
        breakdown.push(`Base Price (${meetAndGreetType}): £${meetAndGreetType === "connection" ? 280 : 140}`);

        const additionalPassengers = Math.max(0, passengers - 2);
        const additionalPassengerCost = additionalPassengers * 45;
        if (additionalPassengers > 0) {
          breakdown.push(`Additional Passengers (${additionalPassengers}): £${additionalPassengerCost}`);
        }
        basePrice += additionalPassengerCost;

        const additionalHoursCost = additionalHours * 50;
        if (additionalHours > 0) {
          breakdown.push(`Additional Hours (${additionalHours}): £${additionalHoursCost}`);
        }
        basePrice += additionalHoursCost;

        if (wantBuggy) {
          basePrice += 80;
          breakdown.push(`Buggy: £80`);
        }

        const porterBags = Math.ceil(bags / 8) * 65;
        if (bags > 0) {
          breakdown.push(`Porter (${bags} bags): £${porterBags}`);
        }
        basePrice += porterBags;

        if (unsocialCharge) {
          basePrice += unsocialCharge;
          breakdown.push(`Unsolicited Hours Fee: £${unsocialCharge}`);
        }
        break;

      case "airportTransfer":
        const distance = calculateMockDistance(pickupLocation, dropoffLocation);
        const vehiclePrices: Record<string, number> = { sedan: 180, suv: 250, van: 300 };
        basePrice = vehiclePrices[vehicle] + distance * 2;
        breakdown.push(`Base Price (${vehicle}): £${vehiclePrices[vehicle]}`);
        breakdown.push(`Distance (${distance} miles): £${distance * 2}`);
        break;

      case "dailyHire":
        const dailyRates: Record<string, number> = { sedan: 1440, suv: 1920, van: 2400 };
        basePrice = dailyRates[vehicle];
        breakdown.push(`Daily Rate (${vehicle}): £${basePrice}`);
        break;
    }

    if (isFestive) {
      const originalBase = basePrice;
      basePrice *= festiveMultiplier;
      breakdown.push(`Festive Period (x${festiveMultiplier}): £${originalBase} → £${basePrice}`);
    }

    const vatAmount = basePrice * vatRate;
    breakdown.push(`VAT (20%): £${vatAmount.toFixed(2)}`);

    const total = basePrice + vatAmount;
    breakdown.push(`Total: £${total.toFixed(2)}`);

    setPriceBreakdown(breakdown);
    return total;
  }, [
    date, hour, minute, period, isFestive, serviceType, 
    meetAndGreetType, passengers, additionalHours, 
    wantBuggy, bags, pickupLocation, dropoffLocation, vehicle
  ]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const price = calculatePrice();
    setEstimatedPrice(`£${price.toFixed(2)}`);
    setShowModal(true);
  }, [calculatePrice]);

  const handleBooking = useCallback(async () => {
    if (!date || !hour || !minute || !period) return;

    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));
    const bookingData = {
      service_type: serviceType,
      date_time: new Date(
        `${format(date, "yyyy-MM-dd")}T${hour24.toString().padStart(2, "0")}:${minute}:00`
      ),
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      vehicle: vehicle,
      passengers: passengers,
      additional_hours: additionalHours,
      want_buggy: wantBuggy,
      want_porter: wantPorter,
      bags: bags,
      meet_and_greet_type: meetAndGreetType,
    };

    try {
      const { error } = await supabase.from("bookings").insert([bookingData]);
      if (error) throw error;
      console.log("Booking saved successfully!");
      setShowModal(false);
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Failed to save booking. Please try again.");
    }
  }, [
    date, hour, minute, period, serviceType, pickupLocation,
    dropoffLocation, vehicle, passengers, additionalHours,
    wantBuggy, wantPorter, bags, meetAndGreetType
  ]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimate Your Journey</CardTitle>
        <CardDescription>Fill in the details below to get an estimated price for your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <ServiceTypeSelector serviceType={serviceType} setServiceType={setServiceType} />
        <JourneyForm
          serviceType={serviceType}
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
          locations={PREDEFINED_LOCATIONS}
        />
        <PriceModal
          showModal={showModal}
          setShowModal={setShowModal}
          estimatedPrice={estimatedPrice}
          priceBreakdown={priceBreakdown}
          onContinue={handleBooking}
        />
      </CardContent>
    </Card>
  );
}