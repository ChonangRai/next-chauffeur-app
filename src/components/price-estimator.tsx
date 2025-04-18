"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export function PriceEstimator() {
  const [date, setDate] = useState<Date>()
  const [showEstimate, setShowEstimate] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState("$0.00")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would calculate based on distance, vehicle type, etc.
    setEstimatedPrice("$149.99")
    setShowEstimate(true)
  }

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
                <Input id="pickup" placeholder="Enter pickup address" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="Enter destination address" required />
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
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Select time</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="grid gap-2">
                      <Select defaultValue="12">
                        <SelectTrigger>
                          <SelectValue placeholder="Hour" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="00">
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
                      <Select defaultValue="am">
                        <SelectTrigger>
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Type</Label>
              <Select defaultValue="sedan">
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
              <Select defaultValue="1">
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

          <Button type="submit" className="w-full">
            Calculate Estimate
          </Button>
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
  )
}

