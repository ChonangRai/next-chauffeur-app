"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriceEstimator() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [minute, setMinute] = useState<string | undefined>(undefined);
  const [period, setPeriod] = useState<string | undefined>(undefined);
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicle, setVehicle] = useState("sedan");
  const [passengers, setPassengers] = useState("1");
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState("£0.00");
  const [formChanged, setFormChanged] = useState(false);

  const defaultDate = addDays(new Date(), 1); // Tomorrow
  const defaultTime = { hour: "2", minute: "00", period: "pm" };

  const formatTime = () => {
    if (!hour || !minute || !period) return "Select time";
    return `${hour}:${minute} ${period.toUpperCase()}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEstimatedPrice("£149.99");
    setShowEstimate(true);
    setFormChanged(false); // Reset formChanged after calculating
  };

  const handleFieldChange = useCallback(() => {
    if (showEstimate) {
      setShowEstimate(false);
      setEstimatedPrice("£0.00");
      setFormChanged(true);
    }
  }, [showEstimate]);

  const handleDateDone = () => {
    if (!date) {
      setDate(defaultDate); // Set default to tomorrow if no date selected
    }
    handleFieldChange();
  };

  const handleTimeDone = () => {
    if (!hour || !minute || !period) {
      setHour(defaultTime.hour);
      setMinute(defaultTime.minute);
      setPeriod(defaultTime.period); // Set default to 2:00 PM
    }
    handleFieldChange();
  };

  // Reset estimate when any field changes
  useEffect(() => {
    handleFieldChange();
  }, [pickup, destination, vehicle, passengers, date, hour, minute, period, handleFieldChange]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Estimate Your Journey</CardTitle>
        <CardDescription>Fill in the details below to get an estimated price for your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  placeholder="Enter pickup address"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Enter destination address"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
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
                    <div className="p-4">
                      <Calendar selected={date} onSelect={setDate} />
                      <Button className="w-full mt-2" onClick={handleDateDone}>
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
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
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                            <SelectItem key={h} value={h.toString()}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={minute} onValueChange={setMinute}>
                        <SelectTrigger className="w-[80px]">
                          <SelectValue placeholder="Minute" />
                        </SelectTrigger>
                        <SelectContent>
                          {["00", "15", "30", "45"].map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
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
                    <Button className="w-full" onClick={handleTimeDone}>
                      Done
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Type</Label>
              <Select value={vehicle} onValueChange={setVehicle}>
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Luxury Sedan</SelectItem>
                  <SelectItem value="suv">Executive SUV</SelectItem>
                  <SelectItem value="van">Luxury Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passengers">Number of Passengers</Label>
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger id="passengers">
                  <SelectValue placeholder="Select number of passengers" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(!showEstimate || formChanged) && (
            <Button type="submit" className="w-full">
              Calculate Estimate
            </Button>
          )}
        </form>

        {showEstimate && (
          <div className="mt-6 p-4 border rounded-lg bg-primary/5">
            <h3 className="font-bold text-lg mb-2">Estimated Price</h3>
            <p className="text-3xl font-bold text-primary">{estimatedPrice}</p>
            <p className="text-sm text-muted-foreground mt-2">
              This is an estimate. Final price may vary based on actual distance, waiting time, and other factors.
            </p>
            <div className="mt-4">
              <Button className="w-full">Book Now</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}