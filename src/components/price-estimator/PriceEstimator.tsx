"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { format, addDays, isWithinInterval, startOfDay } from "date-fns";
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
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

export function PriceEstimator() {
  const [isLoading, setIsLoading] = useState(true);
  const [serviceType, setServiceType] = useState<
    "meetAndGreet" | "airportTransfer" | "dailyHire"
  >("meetAndGreet");
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [hour, setHour] = useState("2");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("pm");
  const [pickupLocationId, setPickupLocationId] = useState<string | null>(null);
  const [dropoffLocationId, setDropoffLocationId] = useState<string | null>(
    null
  );
  const [vehicle, setVehicle] = useState("sedan");
  const [passengers, setPassengers] = useState(1);
  const [additionalHours, setAdditionalHours] = useState(0);
  const [wantBuggy, setWantBuggy] = useState(false);
  const [wantPorter, setWantPorter] = useState(false);
  const [bags, setBags] = useState(0);
  const [meetAndGreetType, setMeetAndGreetType] = useState<
    "arrival" | "departure" | "connection"
  >("arrival");
  const [airport_transfer_type, setAirportTransferType] = useState<
    "one_way" | "round_trip"
  >("one_way");
  const [hire_duration, setHireDuration] = useState<"full_day" | "half_day">(
    "full_day"
  );
  const [estimatedPrice, setEstimatedPrice] = useState("£0.00");
  const [priceBreakdown, setPriceBreakdown] = useState<string[]>([]);
  const [extraInfo, setExtraInfo] = useState<string[]>([]);
  const [isFestive, setIsFestive] = useState(false);
  const [festiveMessage, setFestiveMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>(
    []
  );
  const [vatRate, setVatRate] = useState<number>(0.2);
  const [vehicleRates, setVehicleRates] = useState<Record<string, number>>({});
  const [airportTransferRate, setAirportTransferRate] = useState<number | null>(
    null
  );
  const [meetAndGreetRate, setMeetAndGreetRate] = useState({
    arrivalDeparture: 140,
    connectionDifferentTerminals: 280,
  });
  const [extraCharges, setExtraCharges] = useState({
    unsocial_hours: 60,
    festive_period_multiplier: 2,
    additional_hour: 50,
    porter_per_8_bags: 65,
    buggy: 80,
  });
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [flightNumberArrival, setFlightNumberArrival] = useState("");
  const [flightNumberDeparture, setFlightNumberDeparture] = useState("");
  const currentYear = new Date().getFullYear();
  const FESTIVE_PERIODS = useMemo(
    () => getFestivePeriods(currentYear),
    [currentYear]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: locationsData, error: locationsError } = await supabase
          .from("locations")
          .select("id, airport, terminal, hotel_name_address")
          .eq("status", "active")
          .order("airport", { ascending: true });

        if (locationsError) throw locationsError;

        const locationList =
          locationsData.map((loc) => ({
            id: loc.id,
            name:
              loc.hotel_name_address ||
              (loc.terminal ? `${loc.airport} ${loc.terminal}` : loc.airport),
          })) || [];
        setLocations(locationList);

        if (locationList.length > 0 && !pickupLocationId) {
          setPickupLocationId(locationList[0].id);
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
          const airportRate =
            pricingData.find((item) => item.service_type === "airportTransfer")
              ?.value || 100;
          const meetGreetArrival =
            pricingData.find((item) => item.service_type === "meetAndGreet")
              ?.value || 140;
          const meetGreetConnectionDiff =
            pricingData.find(
              (item) =>
                item.service_type === "meetAndGreetConnectionDifferentTerminals"
            )?.value || 280;

          setAirportTransferRate(airportRate);
          setMeetAndGreetRate({
            arrivalDeparture: meetGreetArrival,
            connectionDifferentTerminals: meetGreetConnectionDiff,
          });
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
          const chargesMap = chargesData.reduce(
            (acc, { charge_type, amount }) => {
              acc[charge_type] = parseFloat(amount) || 0;
              return acc;
            },
            {} as Record<string, number>
          );

          setExtraCharges({
            unsocial_hours: chargesMap["unsocial_hours"] || 60,
            festive_period_multiplier:
              chargesMap["festive_period_multiplier"] || 2,
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
          const rates = vehiclesData.reduce(
            (acc, { vehicle_type, base_price }) => {
              acc[vehicle_type] = base_price;
              return acc;
            },
            {} as Record<string, number>
          );

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
    setFestiveMessage(
      festivePeriod
        ? `${festivePeriod.name}: Price doubled during festive period`
        : ""
    );
  }, [date, FESTIVE_PERIODS]);

  useEffect(() => {
    if (!hour || !period) return;

    const hour24 =
      period === "pm"
        ? hour === "12"
          ? 12
          : parseInt(hour) + 12
        : hour === "12"
        ? 0
        : parseInt(hour);
    const hasUnsocialHours = hour24 >= 22 || hour24 < 6;
    const unsocialMessage = hasUnsocialHours
      ? `Unsolicited Hours (22:00-06:00): Additional £${extraCharges.unsocial_hours} + VAT applies`
      : "";

    setExtraInfo((prev) => {
      const otherMessages = prev.filter(
        (msg) => !msg.includes("Unsolicited Hours")
      );
      return hasUnsocialHours
        ? [...otherMessages, unsocialMessage]
        : otherMessages;
    });
  }, [hour, period, extraCharges.unsocial_hours]);

  useEffect(() => {
    if (!festiveMessage) return;

    setExtraInfo((prev) => {
      const otherMessages = prev.filter(
        (msg) => !msg.includes("festive period")
      );
      return festiveMessage
        ? [...otherMessages, festiveMessage]
        : otherMessages;
    });
  }, [festiveMessage]);

  const getLocationDetails = async (locationId: string | null) => {
    if (!locationId) return { airport: null, terminal: null };
    const { data, error } = await supabase
      .from("locations")
      .select("airport, terminal")
      .eq("id", locationId)
      .single();
    if (error) {
      console.error("Error fetching location details:", error);
      return { airport: null, terminal: null };
    }
    return {
      airport: data.airport,
      terminal: data.terminal,
    };
  };

  const compareLocations = async () => {
    if (!pickupLocationId || !dropoffLocationId)
      return { isSameTerminal: false, isSameAirport: false };

    const pickup = await getLocationDetails(pickupLocationId);
    const dropoff = await getLocationDetails(dropoffLocationId);

    const isSameTerminal = pickupLocationId === dropoffLocationId;
    const isSameAirport = pickup.airport === dropoff.airport;

    return { isSameTerminal, isSameAirport };
  };

  useEffect(() => {
    if (
      serviceType === "meetAndGreet" &&
      meetAndGreetType === "connection" &&
      pickupLocationId &&
      dropoffLocationId
    ) {
      compareLocations().then(({ isSameAirport }) => {
        if (!isSameAirport) {
          setLocationError(
            "Connection between different airports is not supported in Meet and Greet. Please select 'Daily Hire' instead."
          );
        } else {
          setLocationError(null);
        }
      });
    } else {
      setLocationError(null);
    }
  }, [serviceType, meetAndGreetType, pickupLocationId, dropoffLocationId]);

  const calculatePrice = useCallback(async (): Promise<number> => {
    if (!date || !hour || !minute || !period) return 0;

    const hour24 =
      period === "pm"
        ? hour === "12"
          ? 12
          : parseInt(hour) + 12
        : hour === "12"
        ? 0
        : parseInt(hour);
    const breakdown: string[] = [];
    const festiveMultiplier = isFestive
      ? extraCharges.festive_period_multiplier
      : 1;
    const unsocialCharge =
      hour24 >= 22 || hour24 < 6 ? extraCharges.unsocial_hours : 0;

    let basePrice = 0;

    switch (serviceType) {
      case "meetAndGreet":
        let isDifferentTerminals = false;
        if (
          meetAndGreetType === "connection" &&
          pickupLocationId &&
          dropoffLocationId
        ) {
          const { isSameTerminal, isSameAirport } = await compareLocations();
          if (!isSameAirport) return 0;
          isDifferentTerminals = !isSameTerminal;
        }

        basePrice =
          meetAndGreetType === "connection" && isDifferentTerminals
            ? meetAndGreetRate.connectionDifferentTerminals
            : meetAndGreetRate.arrivalDeparture;
        breakdown.push(
          `Base Price (${meetAndGreetType}${
            isDifferentTerminals ? " - Different Terminals" : ""
          }): £${basePrice}`
        );

        const additionalPassengers = Math.max(0, passengers - 2);
        if (additionalPassengers > 0) {
          const additionalPassengerCost = additionalPassengers * 45;
          breakdown.push(
            `Additional Passengers (${additionalPassengers}): £${additionalPassengerCost}`
          );
          basePrice += additionalPassengerCost;
        }

        if (additionalHours > 0) {
          const additionalHoursCost =
            additionalHours * extraCharges.additional_hour;
          breakdown.push(
            `Additional Hours (${additionalHours}): £${additionalHoursCost}`
          );
          basePrice += additionalHoursCost;
        }

        if (wantBuggy) {
          breakdown.push(`Buggy: £${extraCharges.buggy}`);
          basePrice += extraCharges.buggy;
        }

        if (bags > 0) {
          const porterBags =
            Math.ceil(bags / 8) * extraCharges.porter_per_8_bags;
          breakdown.push(`Porter (${bags} bags): £${porterBags}`);
          basePrice += porterBags;
        }
        break;

      case "airportTransfer":
        if (airportTransferRate && pickupLocationId && dropoffLocationId) {
          const pickup = await getLocationDetails(pickupLocationId);
          const dropoff = await getLocationDetails(dropoffLocationId);
          if (
            pickup.airport === "Heathrow" &&
            dropoff.airport === "Heathrow" &&
            pickup.terminal &&
            dropoff.terminal
          ) {
            basePrice = airportTransferRate;
            breakdown.push(
              `Base Price (Terminal to Terminal at Heathrow): £${basePrice}`
            );
          } else if (pickup.airport === "Heathrow") {
            basePrice = airportTransferRate * 0.75;
            breakdown.push(`Base Price (Heathrow to Hotel): £${basePrice}`);
          } else {
            basePrice = airportTransferRate;
            breakdown.push(`Base Price (Other Airport): £${basePrice}`);
          }
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
      breakdown.push(
        `Festive Period (x${festiveMultiplier}): £${originalBase} → £${basePrice}`
      );
    }

    if (unsocialCharge && basePrice > 0) {
      basePrice += unsocialCharge;
      breakdown.push(`Unsolicited Hours Fee: £${unsocialCharge}`);
    }

    if (basePrice > 0) {
      const vatAmount = basePrice * vatRate;
      breakdown.push(
        `VAT (${(vatRate * 100).toFixed(1)}%): £${vatAmount.toFixed(2)}`
      );
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
    pickupLocationId,
    dropoffLocationId,
  ]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (locationError) return;
      const price = await calculatePrice();
      if (price === 0) return;
      setEstimatedPrice(`£${price.toFixed(2)}`);
      setShowModal(true);
    },
    [calculatePrice, locationError]
  );

  const handleContinueToBooking = () => {
    if (!date) return;

    // Construct dateTime from date, hour, minute, period
    const hour24 =
      period === "pm"
        ? hour === "12"
          ? 12
          : parseInt(hour) + 12
        : hour === "12"
        ? 0
        : parseInt(hour);
    const dateTime = new Date(date);
    dateTime.setHours(hour24, parseInt(minute), 0, 0);

    // Create and use params immediately
    window.location.href = `/bookings?${new URLSearchParams({
      serviceType,
      dateTime: dateTime.toISOString(),
      pickupLocationId: pickupLocationId || "",
      dropoffLocationId: dropoffLocationId || "",
      passengers: passengers.toString(),
      additionalHours: additionalHours.toString(),
      wantBuggy: wantBuggy.toString(),
      wantPorter: wantPorter.toString(),
      bags: bags.toString(),
      meetAndGreetType: serviceType === "meetAndGreet" ? meetAndGreetType : "",
      airport_transfer_type:
        serviceType === "airportTransfer" ? airport_transfer_type : "",
      hire_duration: serviceType === "dailyHire" ? hire_duration : "",
      flightNumberArrival,
      flightNumberDeparture,
      estimatedPrice: estimatedPrice.replace("£", ""),
      fromEstimator: "true",
    }).toString()}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimate Your Journey</CardTitle>
        <CardDescription>
          Fill in the details below to get an estimated price for your journey.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {locationError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
            {locationError}
          </div>
        )}

        <Tabs
          value={serviceType}
          onValueChange={(value) => {
            setServiceType(
              value as "meetAndGreet" | "airportTransfer" | "dailyHire"
            );
            setLocationError(null);
          }}
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
                pickupLocationId={pickupLocationId}
                setPickupLocationId={setPickupLocationId}
                dropoffLocationId={dropoffLocationId}
                setDropoffLocationId={setDropoffLocationId}
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
                locationError={locationError}
                flightNumberArrival={flightNumberArrival}
                setFlightNumberArrival={setFlightNumberArrival}
                flightNumberDeparture={flightNumberDeparture}
                setFlightNumberDeparture={setFlightNumberDeparture}
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
