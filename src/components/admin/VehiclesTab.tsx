"use client";
import { useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Vehicle } from "@/types/admin";
import { Label } from "../ui/label";
import Image from "next/image";

type VehicleFormData = {
  title: string;
  name: string;
  description: string;
  passengers: number;
  bags: number;
  wifi: boolean;
  meet_greet: boolean;
  drinks: boolean;
  waiting_time: string;
  base_price: number;
  price_per_hour: number;
  image_url: string;
};

type VehiclesTabProps = {
  vehicles: Vehicle[];
  isLoadingVehicles: boolean;
  vehicleError: string | null;
  fetchVehicles: () => Promise<void>;
};

export default function VehiclesTab({ vehicles, isLoadingVehicles, vehicleError, fetchVehicles }: VehiclesTabProps) {
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState<VehicleFormData>({
    title: "",
    name: "",
    description: "",
    passengers: 1,
    bags: 0,
    wifi: false,
    meet_greet: false,
    drinks: false,
    waiting_time: "",
    base_price: 0,
    price_per_hour: 0,
    image_url: "",
  });
  const [newVehicleImage, setNewVehicleImage] = useState<File | null>(null);
  const [editVehicleImage, setEditVehicleImage] = useState<File | null>(null);

  const resetNewVehicleForm = () => {
    setNewVehicle({
      title: "",
      name: "",
      description: "",
      passengers: 1,
      bags: 0,
      wifi: false,
      meet_greet: false,
      drinks: false,
      waiting_time: "",
      base_price: 0,
      price_per_hour: 0,
      image_url: "",
    });
    setNewVehicleImage(null);
  };

  // Common modal footer component
  const ModalFooter = ({ onSave, onCancel, saveLabel = "Save" }: {
    onSave: () => void;
    onCancel: () => void;
    saveLabel?: string;
  }) => (
    <div className="flex gap-2 mt-4">
      <Button onClick={onSave}>{saveLabel}</Button>
      <Button variant="outline" onClick={onCancel}>Cancel</Button>
    </div>
  );

  const handleAddVehicle = async () => {
    const passengers = 1;
    const bags = 0;

    if (
      !newVehicle.title ||
      !newVehicle.name ||
      isNaN(passengers) ||
      passengers <= 0 ||
      isNaN(bags) ||
      bags < 0 ||
      !newVehicle.waiting_time ||
      newVehicle.base_price <= 0
    ) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    try {
      let imageUrl = "";
      if (newVehicleImage) {
        const fileExt = newVehicleImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("vehicles")
          .upload(fileName, newVehicleImage);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabaseAdmin.storage
          .from("vehicles")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const vehicleData = {
        ...newVehicle,
        passengers,
        bags,
        image_url: imageUrl || null,
        price_per_hour: newVehicle.price_per_hour || 0,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin.from("vehicles").insert(vehicleData);
      if (error) throw new Error(error.message);

      setShowAddVehicleModal(false);
      resetNewVehicleForm();
      await fetchVehicles();
      alert("Vehicle added successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error adding vehicle:", err.message);
        alert(`Failed to add vehicle: ${err.message}`);
      } else {
        console.error("Unknown error adding vehicle");
        alert("Failed to add vehicle: Unknown error");
      }
    }
  };

  const handleEditVehicle = async () => {
    if (!editingVehicle) {
      alert("No vehicle selected for editing.");
      return;
    }

    if (
      !editingVehicle.title ||
      !editingVehicle.name ||
      editingVehicle.passengers < 1 ||
      editingVehicle.bags < 0 ||
      !editingVehicle.waiting_time ||
      editingVehicle.base_price <= 0
    ) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    try {
      let imageUrl = editingVehicle.image_url || "";

      if (editVehicleImage) {
        const fileExt = editVehicleImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from("vehicles")
          .upload(fileName, editVehicleImage);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabaseAdmin.storage
          .from("vehicles")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const { id, ...updateData } = editingVehicle;
      const vehicleData = {
        ...updateData,
        image_url: imageUrl || null,
      };

      const { error } = await supabaseAdmin
        .from("vehicles")
        .update(vehicleData)
        .eq("id", id);

      if (error) throw new Error(error.message);

      setShowEditVehicleModal(false);
      setEditingVehicle(null);
      setEditVehicleImage(null);
      await fetchVehicles();
      alert("Vehicle updated successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error editing vehicle details:", err.message);
        alert(`Failed to edit vehicle: ${err.message}`);
      } else {
        console.error("Unknown error editing vehicle");
        alert("Failed to edit vehicle: Unknown error");
      }
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }

    try {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle?.image_url) {
        const imagePath = vehicle.image_url.split("/").pop();
        if (imagePath) {
          const { error: storageError } = await supabaseAdmin.storage
            .from("vehicles")
            .remove([imagePath]);

          if (storageError) {
            console.warn("Failed to delete associated image:", storageError.message);
          }
        }
      }

      const { error: deleteError } = await supabaseAdmin
        .from("vehicles")
        .delete()
        .eq("id", vehicleId);

      if (deleteError) {
        throw new Error(`Database deletion failed: ${deleteError.message}`);
      }

      await fetchVehicles();
      alert("Vehicle deleted successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error deleting vehicle:", err.message);
        alert(`Failed to delete vehicle: ${err.message}`);
      } else {
        console.error("Unknown error deleting vehicle");
        alert("Failed to delete vehicle: Unknown error");
      }
    }
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle({
      ...vehicle,
      title: vehicle.title || "",
      name: vehicle.name || "",
      description: vehicle.description || "",
      passengers: 1,
      bags: 0,
      wifi: vehicle.wifi ?? false,
      meet_greet: vehicle.meet_greet ?? false,
      drinks: vehicle.drinks ?? false,
      waiting_time: vehicle.waiting_time || "",
      base_price: vehicle.base_price || 0,
      price_per_hour: vehicle.price_per_hour || 0,
      image_url: vehicle.image_url || "",
    });
    setShowEditVehicleModal(true);
  };

  // Common input fields for both add and edit modals
  const renderVehicleFormFields = (
    formData: VehicleFormData,
    setFormData: React.Dispatch<React.SetStateAction<VehicleFormData>>,
    imageFile: File | null,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>,
    isEditMode = false
  ) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g., BUSINESS CLASS"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., Mercedes-Benz E-Class"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Vehicle description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="passengers">Passengers</Label>
          <Input
            id="passengers"
            type="number"
            min="1"
            placeholder="Number of passengers"
            value={formData.passengers}
            onChange={(e) => setFormData({
              ...formData,
              passengers: parseInt(e.target.value) || 0
            })}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="bags">Bags</Label>
          <Input
            id="bags"
            type="number"
            min="0"
            placeholder="Number of bags"
            value={formData.bags}
            onChange={(e) => setFormData({
              ...formData,
              bags: parseInt(e.target.value) || 0
            })}
          />
        </div>
      </div>

      <div className="flex gap-4">
        {["wifi", "meet_greet", "drinks"].map((amenity) => (
          <div key={amenity} className="flex items-center gap-2">
            <Checkbox
              id={amenity}
              checked={formData[amenity as keyof VehicleFormData] as boolean}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, [amenity]: checked as boolean })
              }
            />
            <Label htmlFor={amenity}>
              {amenity
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="waiting_time">Waiting Time</Label>
          <Input
            id="waiting_time"
            placeholder="Waiting Time"
            value={formData.waiting_time}
            onChange={(e) => setFormData({ ...formData, waiting_time: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="base_price">Base Price (£)</Label>
          <Input
            id="base_price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 49.99"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="price_per_hour">Price per Hour (£)</Label>
          <Input
            id="price_per_hour"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g., 15.00"
            value={formData.price_per_hour}
            onChange={(e) => setFormData({ ...formData, price_per_hour: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="vehicle_image">Vehicle Image</Label>
        {isEditMode && formData.image_url && (
          <div className="mb-2">
            <Image
              src={formData.image_url}
              alt="Current vehicle"
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded"
            />
          </div>
        )}
        <Input
          id="vehicle_image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.type.startsWith("image/") && file.size < 5 * 1024 * 1024) {
              setImageFile(file);
            } else {
              alert("Please upload a valid image under 5MB.");
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Vehicles</h2>
        <Button onClick={() => setShowAddVehicleModal(true)}>Add Vehicle</Button>
      </div>

      {isLoadingVehicles ? (
        <p className="text-center">Loading vehicles...</p>
      ) : vehicleError ? (
        <p className="text-red-500 text-center">{vehicleError}</p>
      ) : vehicles.length === 0 ? (
        <p className="text-center">No vehicles found.</p>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Passengers</th>
                <th className="p-2 text-left">Bags</th>
                <th className="p-2 text-left">Base Price</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b">
                  <td className="p-2">
                    {vehicle.image_url ? (
                      <Image
                        width={64}
                        height={64}
                        src={vehicle.image_url}
                        alt={vehicle.name}
                        className="object-cover"
                      />
                    ) : (
                      "No Image Here"
                    )}
                  </td>
                  <td className="p-2">{vehicle.title}</td>
                  <td className="p-2">{vehicle.name}</td>
                  <td className="p-2">{vehicle.passengers}</td>
                  <td className="p-2">{vehicle.bags}</td>
                  <td className="p-2">£{vehicle.base_price.toFixed(2)}</td>
                  <td className="p-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(vehicle)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Add New Vehicle</h3>
            {renderVehicleFormFields(newVehicle, setNewVehicle, newVehicleImage, setNewVehicleImage)}
            <ModalFooter
              onSave={handleAddVehicle}
              onCancel={() => {
                setShowAddVehicleModal(false);
                resetNewVehicleForm();
              }}
              saveLabel="Add Vehicle"
            />
          </div>
        </div>
      )}

      {showEditVehicleModal && editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Vehicle</h3>
            {renderVehicleFormFields(
              {
                ...editingVehicle,
              } as VehicleFormData,
              (newData) => setEditingVehicle((prev) => ({
                ...prev!,
                ...newData,
              })),
              editVehicleImage,
              setEditVehicleImage,
              true
            )}
            <ModalFooter
              onSave={handleEditVehicle}
              onCancel={() => {
                setShowEditVehicleModal(false);
                setEditingVehicle(null);
                setEditVehicleImage(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}