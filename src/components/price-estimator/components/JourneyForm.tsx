import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import MeetAndGreetOptions from "./MeetAndGreetOptions";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface JourneyFormProps {
  serviceType: "meetAndGreet" | "airportTransfer" | "dailyHire";
  step: "estimate" | "details";
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  hour: string;
  setHour: (hour: string) => void;
  minute: string;
  setMinute: (minute: string) => void;
  period: string;
  setPeriod: (period: string) => void;
  pickupLocation: string;
  setPickupLocation: (location: string) => void;
  dropoffLocation: string;
  setDropoffLocation: (location: string) => void;
  vehicle: string;
  setVehicle: (vehicle: string) => void;
  passengers: number;
  setPassengers: (passengers: number) => void;
  additionalHours: number;
  setAdditionalHours: (hours: number) => void;
  wantBuggy: boolean;
  setWantBuggy: (want: boolean) => void;
  wantPorter: boolean;
  setWantPorter: (want: boolean) => void;
  bags: number;
  setBags: (bags: number) => void;
  meetAndGreetType: "arrival" | "departure" | "connection";
  setMeetAndGreetType: (type: "arrival" | "departure" | "connection") => void;
  festiveMessage: string;
  extraInfo: string[];
  handleSubmit: (e: React.FormEvent, proceedToDetails?: boolean) => void;
  locations: string[];
  fullName: string;
  setFullName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  additionalRequests: string;
  setAdditionalRequests: (requests: string) => void;
  contactConsent: boolean;
  setContactConsent: (consent: boolean) => void;
  calculatedAmount: number | null;
  locationError?: string | null; // Added prop for location error
}

export default function JourneyForm({
  serviceType,
  step,
  date,
  setDate,
  hour,
  setHour,
  minute,
  setMinute,
  period,
  setPeriod,
  pickupLocation,
  setPickupLocation,
  dropoffLocation,
  setDropoffLocation,
  vehicle,
  setVehicle,
  passengers,
  setPassengers,
  additionalHours,
  setAdditionalHours,
  wantBuggy,
  setWantBuggy,
  wantPorter,
  setWantPorter,
  bags,
  setBags,
  meetAndGreetType,
  setMeetAndGreetType,
  festiveMessage,
  extraInfo,
  handleSubmit,
  locations,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  additionalRequests,
  setAdditionalRequests,
  contactConsent,
  setContactConsent,
  calculatedAmount,
  locationError,
}: JourneyFormProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);

  const formatTime = () => {
    if (!hour || !minute || !period) return "Select time";
    return `${hour}:${minute} ${period.toUpperCase()}`;
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, step === "estimate")} className="space-y-6">
      {step === "estimate" && (
        <>
          {serviceType === "meetAndGreet" && (
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="w-full sm:w-1/2 space-y-2">
                <Label>{meetAndGreetType === "connection" ? "Arrival Terminal" : "Pickup Location"}</Label>
                <div className="w-1/2 max-w-[150px]">
                  <Select value={pickupLocation} onValueChange={setPickupLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder={meetAndGreetType === "connection" ? "Select arrival terminal" : "Select pickup"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length > 0 ? (
                        locations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-location" disabled>No locations available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="w-full sm:w-1/2 space-y-2">
                <Label>Meet & Greet Type</Label>
                <div className="w-1/2 max-w-[150px]">
                  <Select value={meetAndGreetType} onValueChange={setMeetAndGreetType}>
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
            </div>
          )}

          {serviceType === "meetAndGreet" && meetAndGreetType === "connection" && (
            <div className="space-y-2 w-full min-w-[200px]">
              <Label>Departure Terminal</Label>
              <div className="w-1/2 max-w-[150px]">
                <Select value={dropoffLocation} onValueChange={setDropoffLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select departure terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.length > 0 ? (
                      locations.map((location) => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-location" disabled>No locations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              {locationError && (
                <p className="text-xs text-red-500 flex items-center max-w-full overflow-hidden truncate">
                  <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                  {locationError}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 w-full min-w-[200px]">
              <Label>Date</Label>
              <div className="w-1/2 max-w-[150px]">
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
                      onSelect={(selectedDate) => {
                        setDate(selectedDate);
                        setDatePopoverOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {festiveMessage && (
                <p className="text-xs text-yellow-600 flex items-center max-w-full overflow-hidden truncate">
                  <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                  {festiveMessage}
                </p>
              )}
            </div>

            <div className="space-y-2 w-full min-w-[200px]">
              <Label>Time</Label>
              <div className="w-1/2 max-w-[150px]">
                <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
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
                    <Button type="button" variant="outline" className="w-full" onClick={() => setTimePopoverOpen(false)}>
                      Done
                    </Button>
                  </PopoverContent>
                </Popover>
                {extraInfo.some(info => info.includes("Unsolicited Hours")) && (
                  <p className="text-xs text-yellow-600 flex items-center max-w-full overflow-hidden truncate">
                    <AlertCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                    {extraInfo.find(info => info.includes("Unsolicited Hours"))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {(serviceType === "airportTransfer" || serviceType === "dailyHire") && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 w-full min-w-[200px]">
                <Label htmlFor="dropOff">{serviceType === "dailyHire" ? "Journey Start" : "Destination"}</Label>
                <div className="w-1/2 max-w-[150px]">
                  <Select value={dropoffLocation} onValueChange={setDropoffLocation}>
                    <SelectTrigger id="dropOff">
                      <SelectValue placeholder={serviceType === "dailyHire" ? "Select journey start" : "Select destination"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.length > 0 ? (
                        locations.map((location) => (
                          <SelectItem key={location} value={location}>{location}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-location" disabled>No locations available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 w-full min-w-[200px]">
                <Label htmlFor="vehicle">Vehicle Type</Label>
                <div className="w-1/2 max-w-[150px]">
                  <Select value={vehicle} onValueChange={setVehicle}>
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
              </div>
            </div>
          )}

          {serviceType === "meetAndGreet" && (
            <MeetAndGreetOptions
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
            />
          )}

          <div className="flex justify-end">
            {calculatedAmount !== null ? (
              <Button type="submit" className="w-auto px-4">
                Continue With Booking
              </Button>
            ) : (
              <Button type="submit" className="w-auto px-4" disabled={!!locationError}>
                Calculate Estimate
              </Button>
            )}
          </div>
        </>
      )}

      {step === "details" && calculatedAmount !== null && (
        <>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalRequests">Additional Requests</Label>
            <Textarea id="additionalRequests" value={additionalRequests} onChange={(e) => setAdditionalRequests(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              <input
                id="contactConsent"
                type="checkbox"
                checked={contactConsent}
                onChange={(e) => setContactConsent(e.target.checked)}
                className="mr-2"
              />
              <span>I agree to be contacted if there are issues with my booking.</span>
            </Label>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-semibold">Estimated Cost: £{calculatedAmount.toFixed(2)}</p>
            <Button type="submit" className="w-full">
              Book Now
            </Button>
          </div>
        </>
      )}
    </form>
  );
}