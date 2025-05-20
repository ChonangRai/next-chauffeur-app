import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Location, Vehicle } from "@/lib/types";
import { forwardRef } from "react";

interface JourneyFormProps {
  type: "meetAndAssist" | "airportTransfer" | "hireByHour";
  locations: Location[];
  vehicles?: Vehicle[];
  onCalculate: (e?: React.FormEvent) => void;
  submitButtonText?: string;
  isLoading?: boolean;
  formData: {
    date: Date | undefined;
    hour: string;
    minute: string;
    meetAndAssistType?: "arrival" | "departure" | "connection";
    passengers: number;
    wantBuggy?: boolean;
    wantPorter?: boolean;
    bags?: number;
    flightNumberArrival?: string;
    flightNumberDeparture?: string;
    additionalHours: number;
    vehicle?: string;
    pickupLocationId?: string;
  };
  setFormData: {
    setDate: (date: Date | undefined) => void;
    setHour: (hour: string) => void;
    setMinute: (minute: string) => void;
    setMeetAndAssistType?: (type: "arrival" | "departure" | "connection") => void;
    setPassengers: (passengers: number) => void;
    setWantBuggy?: (want: boolean) => void;
    setWantPorter?: (want: boolean) => void;
    setBags?: (bags: number) => void;
    setFlightNumberArrival?: (flight: string) => void;
    setFlightNumberDeparture?: (flight: string) => void;
    setAdditionalHours: (hours: number) => void;
    setVehicle?: (vehicle: string) => void;
    setPickupLocationId?: (id: string) => void;
  };
}

export default function JourneyForm({
  type,
  locations,
  vehicles,
  onCalculate,
  formData,
  setFormData,
  submitButtonText = "Calculate Estimate",
  isLoading = false,
}: JourneyFormProps) {
  const formatTime = (hour: string, minute: string) => {
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const MAX_PASSENGERS = 8;
  const MAX_BAGS = 16;
  const MAX_ADDITIONAL_HOURS = 12;

  const DatePickerButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !formData.date && "text-muted-foreground",
          className
        )}
        {...props}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formData.date ? format(formData.date, "MMM do, yyyy") : "Select date"}
      </Button>
    )
  );
  DatePickerButton.displayName = "DatePickerButton";

  const TimePickerButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !formData.hour && "text-muted-foreground",
          className
        )}
        {...props}
      >
        <Clock className="mr-2 h-4 w-4" />
        {formData.hour ? formatTime(formData.hour, formData.minute) : "Select time"}
      </Button>
    )
  );
  TimePickerButton.displayName = "TimePickerButton";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onCalculate(); }} className="space-y-8">
      <div className="grid gap-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Pickup Location */}
          <div className="w-[240px] space-y-3">
            <Label>Pickup Location</Label>
            <Select
              value={formData.pickupLocationId || ""}
              onValueChange={(value) => {
                setFormData.setPickupLocationId?.(value);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Meet & Greet Type */}
          {formData.meetAndAssistType && setFormData.setMeetAndAssistType && (
            <div className="w-[240px] space-y-3">
              <Label>Meet & Greet Type</Label>
              <Select
                value={formData.meetAndAssistType}
                onValueChange={setFormData.setMeetAndAssistType}
                disabled={isLoading}
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
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Date */}
          <div className="w-[240px] space-y-3">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <DatePickerButton disabled={isLoading} />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  selected={formData.date}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setFormData.setDate(date);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="w-[240px] space-y-3">
            <Label>Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <TimePickerButton disabled={isLoading} />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="grid gap-4 p-4">
                  <div className="grid gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Select 
                        value={formData.hour} 
                        onValueChange={(val) => {
                          const hour24 = parseInt(val);
                          setFormData.setHour(hour24.toString().padStart(2, "0"));
                        }}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                              {hour.toString().padStart(2, "0")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select 
                        value={formData.minute} 
                        onValueChange={setFormData.setMinute}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {["00", "15", "30", "45"].map((minute) => (
                            <SelectItem key={minute} value={minute}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Passengers */}
          <div className="space-y-3">
            <Label>Number of Passengers</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData.setPassengers(Math.max(1, formData.passengers - 1))}
                disabled={isLoading || formData.passengers <= 1}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{formData.passengers}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData.setPassengers(Math.min(MAX_PASSENGERS, formData.passengers + 1))}
                disabled={isLoading || formData.passengers >= MAX_PASSENGERS}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Hours */}
          <div className="space-y-3">
            <Label>Additional Hours</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData.setAdditionalHours(Math.max(0, formData.additionalHours - 1))}
                disabled={isLoading || formData.additionalHours <= 0}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center">{formData.additionalHours}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData.setAdditionalHours(Math.min(MAX_ADDITIONAL_HOURS, formData.additionalHours + 1))}
                disabled={isLoading || formData.additionalHours >= MAX_ADDITIONAL_HOURS}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Vehicle Selection for Hire by Hour */}
        {type === "hireByHour" && vehicles && setFormData.setVehicle && (
          <div className="space-y-3">
            <Label>Select Vehicle</Label>
            <Select
              value={formData.vehicle}
              onValueChange={setFormData.setVehicle}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Additional Services */}
        {type === "meetAndAssist" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Buggy Service */}
              <div className="space-y-3">
                <Label>Want Buggy Service?</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData.setWantBuggy?.(true)}
                    disabled={isLoading}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      !formData.wantBuggy && "bg-transparent text-foreground"
                    )}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData.setWantBuggy?.(false)}
                    disabled={isLoading}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      formData.wantBuggy && "bg-transparent text-foreground"
                    )}
                  >
                    No
                  </Button>
                </div>
              </div>

              {/* Porter Service */}
              <div className="space-y-3">
                <Label>Want Porter Service?</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData.setWantPorter?.(true)}
                    disabled={isLoading}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      !formData.wantPorter && "bg-transparent text-foreground"
                    )}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData.setWantPorter?.(false)}
                    disabled={isLoading}
                    className={cn(
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      formData.wantPorter && "bg-transparent text-foreground"
                    )}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>

            {formData.wantPorter && setFormData.setBags && (
              <div className="space-y-3">
                <Label>Number of Bags</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (setFormData.setBags) {
                        setFormData.setBags(Math.max(0, (formData.bags || 0) - 1));
                      }
                    }}
                    disabled={isLoading || (formData.bags || 0) <= 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{formData.bags || 0}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (setFormData.setBags) {
                        setFormData.setBags(Math.min(MAX_BAGS, (formData.bags || 0) + 1));
                      }
                    }}
                    disabled={isLoading || (formData.bags || 0) >= MAX_BAGS}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isLoading}
        >
          {submitButtonText}
        </Button>
      </div>
    </form>
  );
}
