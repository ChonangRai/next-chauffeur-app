import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isWithinInterval, startOfDay } from "date-fns";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFestivePeriods } from "@/lib/festive-periods";

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
  const [startingAirport, setStartingAirport] = useState("Heathrow Airport Terminal 5");
  const [destination, setDestination] = useState("London City Airport");
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
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const FESTIVE_PERIODS = getFestivePeriods(currentYear);

  // Check for festive period and unsocial hours whenever date or time changes
  useEffect(() => {
    if (!date || !hour || !minute || !period) return;

    // Convert hour to 24-hour format
    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));
    
    // Construct the date string in ISO 8601 format (e.g., "2025-12-25T14:00:00")
    const bookingDateTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${hour24.toString().padStart(2, "0")}:${minute}:00`
    );

    const newExtraInfo: string[] = [];

    // Normalize dates to start of day for comparison
    const bookingDate = startOfDay(bookingDateTime);

    // Check festive periods
    const festivePeriod = FESTIVE_PERIODS.find(period => {
      const start = startOfDay(period.start);
      const end = startOfDay(period.end);
      return isWithinInterval(bookingDate, { start, end });
    });

    if (festivePeriod) {
      const message = `${festivePeriod.name}: Price doubled during festive period`;
      newExtraInfo.push(message);
      setIsFestive(true);
      setFestiveMessage(message);
    } else {
      setIsFestive(false);
      setFestiveMessage("");
    }

    // Check unsocial hours (10pm to 6am)
    if (hour24 >= 22 || hour24 < 6) {
      newExtraInfo.push("Unsolicited Hours (22:00-06:00): Additional £60 + VAT applies");
    }

    setExtraInfo(newExtraInfo);
  }, [date, hour, minute, period]);

  const formatTime = () => {
    if (!hour || !minute || !period) return "Select time";
    return `${hour}:${minute} ${period.toUpperCase()}`;
  };

  const calculatePrice = (): number => {
    if (!date || !hour || !minute || !period) return 0;

    let basePrice = 0;
    const vatRate = 0.2;
    const hour24 = period === "pm"
      ? (hour === "12" ? 12 : parseInt(hour) + 12)
      : (hour === "12" ? 0 : parseInt(hour));
    const bookingDateTime = new Date(
      `${format(date, "yyyy-MM-dd")}T${hour24.toString().padStart(2, "0")}:${minute}:00`
    );

    const breakdown: string[] = [];
    let festiveMultiplier = 1;
    let unsocialCharge = 0;

    // Use the isFestive state set in useEffect
    if (isFestive) {
      festiveMultiplier = 2;
    }

    // Check unsocial hours
    const isUnsolicited = hour24 >= 22 || hour24 < 6;
    if (isUnsolicited) unsocialCharge = 60;

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

        if (isUnsolicited) {
          basePrice += unsocialCharge;
          breakdown.push(`Unsolicited Hours Fee: £${unsocialCharge}`);
        }
        break;

      case "airportTransfer":
        const distance = calculateMockDistance(startingAirport, destination);
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

    // Apply festive multiplier
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = calculatePrice();
    setEstimatedPrice(`£${price.toFixed(2)}`);
    setShowModal(true);
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setDatePopoverOpen(false); // Close the popover when date is selected
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimate Your Journey</CardTitle>
        <CardDescription>Fill in the details below to get an estimated price for your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Type Tabs */}
          <nav className="nav-tabs border-b border-gray-200 mb-4">
            <div className="flex space-x-2">
              <button
                type="button"
                className={cn(
                  "nav-link py-2 px-4 font-medium",
                  serviceType === "meetAndGreet"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
                onClick={() => setServiceType("meetAndGreet")}
              >
                Meet & Greet
              </button>
              <button
                type="button"
                className={cn(
                  "nav-link py-2 px-4 font-medium",
                  serviceType === "airportTransfer"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
                onClick={() => setServiceType("airportTransfer")}
              >
                Airport Transfer
              </button>
              <button
                type="button"
                className={cn(
                  "nav-link py-2 px-4 font-medium",
                  serviceType === "dailyHire"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
                onClick={() => setServiceType("dailyHire")}
              >
                Daily Hire
              </button>
            </div>
          </nav>

          {/* Service-specific fields */}
          {serviceType === "meetAndGreet" && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="w-full sm:w-1/2 space-y-2">
                <Label>Starting Airport</Label>
                <Select
                  value={startingAirport}
                  onValueChange={setStartingAirport}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Heathrow Airport Terminal 5" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                <Label>Meet & Greet Type</Label>
                <Select
                  value={meetAndGreetType}
                  onValueChange={(value) => setMeetAndGreetType(value as "arrival" | "departure" | "connection")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arrival">Arrival</SelectItem>
                    <SelectItem value="departure">Departure</SelectItem>
                    <SelectItem value="connection">Connection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 w-full sm:w-1/2">
              <Label>Date</Label>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    selected={date}
                    onSelect={handleDateSelect}
                  />
                </PopoverContent>
              </Popover>
              {/* Show festive period messages under date */}
              {festiveMessage && (
                <p className="text-sm text-yellow-600 flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {festiveMessage}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full sm:w-1/2">
              <Label>Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !hour && !minute && !period && "text-muted-foreground")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    {formatTime()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4">
                  <div className="flex gap-2 mb-4">
                    <Select value={hour} onValueChange={setHour}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0")).map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={minute} onValueChange={setMinute}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={period} onValueChange={setPeriod}>
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="AM/PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="am">AM</SelectItem>
                        <SelectItem value="pm">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </PopoverContent>
              </Popover>
              {extraInfo.some(info => info.includes("Unsolicited Hours")) && (
                <p className="text-xs text-yellow-600 inline-flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {extraInfo.find(info => info.includes("Unsolicited Hours"))}
                </p>
              )}
            </div>
          </div>

          {/* Vehicle Selection */}
          {(serviceType === "airportTransfer" || serviceType === "dailyHire") && (
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Type</Label>
              <Select
                value={vehicle}
                onValueChange={setVehicle}
              >
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Luxury Sedan (£180 base)</SelectItem>
                  <SelectItem value="suv">Executive SUV (£250 base)</SelectItem>
                  <SelectItem value="van">Luxury Van (£300 base)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Meet & Greet Specific Fields */}
          {serviceType === "meetAndGreet" && (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="w-full sm:w-1/2 space-y-2">
                  <Label>Number of Passengers</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setPassengers(Math.max(1, passengers - 1))}
                      disabled={passengers <= 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      value={passengers}
                      onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => setPassengers(passengers + 1)}
                    >
                      +
                    </Button>
                  </div>
                  {passengers >= 3 && (
                    <p className="text-xs text-yellow-600 flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Additional passengers (over 2) cost £45 + VAT each
                    </p>
                  )}
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  <Label>Additional Hours</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setAdditionalHours(Math.max(0, additionalHours - 1))}
                      disabled={additionalHours <= 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={additionalHours}
                      onChange={(e) => setAdditionalHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => setAdditionalHours(additionalHours + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-yellow-600 flex items-center">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Additional hours (for more than 2 hours) applies at £50 + VAT per hour.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="w-full sm:w-1/2 space-y-2">
                  <Label>Want Buggy?</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={wantBuggy ? "default" : "outline"}
                      onClick={() => setWantBuggy(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={!wantBuggy ? "default" : "outline"}
                      onClick={() => setWantBuggy(false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
                <div className="w-full sm:w-1/2 space-y-2">
                  <Label>Want Porter?</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={wantPorter ? "default" : "outline"}
                      onClick={() => setWantPorter(true)}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      variant={!wantPorter ? "default" : "outline"}
                      onClick={() => setWantPorter(false)}
                    >
                      No
                    </Button>
                  </div>
                </div>
              </div>

              {wantPorter && (
                <div className="space-y-2">
                  <Label>Number of Bags</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => setBags(Math.max(0, bags - 1))}
                      disabled={bags <= 0}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={bags}
                      onChange={(e) => setBags(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => setBags(bags + 1)}
                    >
                      +
                    </Button>
                  </div>
                  {bags > 8 && (
                    <p className="text-xs text-yellow-600 flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Additional porter fee applies for bags over 8 at £65 + VAT per 8 bags
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full">Calculate Estimate</Button>
        </form>

        {/* Price Estimate Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Price Estimate</h3>
              <div className="space-y-3 mb-6">
                {priceBreakdown.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex justify-between py-2",
                      item.startsWith("Total:") ? "border-t border-gray-200 pt-3 font-bold text-lg" : "",
                      item.includes("→") ? "text-blue-600" : ""
                    )}
                  >
                    <span>{item.split(":")[0]}:</span>
                    <span>{item.split(":")[1]}</span>
                  </div>
                ))}
              </div>
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-primary">{estimatedPrice}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This is an estimate. Final price may vary based on availability.
                </p>
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={() => {
                  console.log("Continue with booking");
                  setShowModal(false);
                }}>Continue with Booking</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}