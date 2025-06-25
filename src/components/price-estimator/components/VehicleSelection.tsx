import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types";
import VehicleServiceCard from "@/components/vehicle/vehicle";

interface VehicleSelectionProps {
  vehicles: Vehicle[];
  onVehicleSelect: (vehicle: Vehicle) => void;
  onBack: () => void;
  formData: {
    date: Date | undefined;
    hour: string;
    minute: string;
    passengers: number;
    additionalHours: number;
    wantBuggy: boolean;
    wantPorter: boolean;
    bags: number;
    pickupLocationId: string;
    customPickupAddress: string;
  };
  setFormData: {
    setDate: (date: Date | undefined) => void;
    setHour: (hour: string) => void;
    setMinute: (minute: string) => void;
    setPassengers: (passengers: number) => void;
    setAdditionalHours: (hours: number) => void;
    setWantBuggy: (want: boolean) => void;
    setWantPorter: (want: boolean) => void;
    setBags: (bags: number) => void;
    setPickupLocationId: (id: string) => void;
    setCustomPickupAddress: (address: string) => void;
  };
  isLoading: boolean;
}

export default function VehicleSelection({
  vehicles,
  onVehicleSelect,
  onBack,
}: VehicleSelectionProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Vehicles</h3>
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <VehicleServiceCard
              key={vehicle.id}
              title={vehicle.title}
              name={vehicle.name}
              description={vehicle.description || ""}
              passengers={vehicle.passengers}
              bags={vehicle.bags}
              wifi={vehicle.wifi}
              meetGreet={vehicle.meet_greet}
              drinks={vehicle.drinks}
              waitingTime={vehicle.waiting_time}
              price={vehicle.base_price}
              selected={selectedVehicle?.id === vehicle.id}
              onSelect={() => handleVehicleSelect(vehicle)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => selectedVehicle && onVehicleSelect(selectedVehicle)}
          disabled={!selectedVehicle}
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 
