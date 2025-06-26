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
  formData,
}: VehicleSelectionProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    // Only allow selection if vehicle can accommodate passengers
    if (vehicle.passengers >= formData.passengers) {
      setSelectedVehicle(vehicle);
    }
  };

  // Filter vehicles based on passenger capacity and availability
  const availableVehicles = vehicles.filter(vehicle => 
    vehicle.passengers >= formData.passengers && 
    vehicle.vehicle_status !== "draft"
  );
  const unavailableVehicles = vehicles.filter(vehicle => 
    vehicle.passengers < formData.passengers && 
    vehicle.vehicle_status !== "draft"
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Available Vehicles</h3>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        </div>
        
        {/* Available Vehicles */}
        {availableVehicles.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-green-700">Suitable for {formData.passengers} passengers</h4>
            {availableVehicles.map((vehicle) => (
              <div key={vehicle.id}>
                <VehicleServiceCard
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
                {/* Show Continue button underneath the selected vehicle */}
                {selectedVehicle?.id === vehicle.id && (
                  <div className="flex justify-end mt-4 p-4 bg-gray-50 rounded-lg border">
                    <Button
                      onClick={() => selectedVehicle && onVehicleSelect(selectedVehicle)}
                      disabled={!selectedVehicle}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Unavailable Vehicles */}
        {unavailableVehicles.length > 0 && (
          <div className="space-y-4 mt-8">
            <h4 className="text-md font-medium text-gray-600">Other vehicles (insufficient capacity)</h4>
            {unavailableVehicles.map((vehicle) => (
              <div key={vehicle.id}>
                <VehicleServiceCard
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
                  disabled={true}
                  requiredPassengers={formData.passengers}
                  onSelect={() => {}} // No action for disabled vehicles
                />
              </div>
            ))}
          </div>
        )}

        {/* No vehicles available */}
        {availableVehicles.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <p className="text-lg font-medium">No vehicles available for {formData.passengers} passengers</p>
              <p className="text-sm mt-2">Please reduce the number of passengers or contact us for a custom solution.</p>
            </div>
            <Button variant="outline" onClick={onBack}>
              Go Back & Adjust Passengers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 
