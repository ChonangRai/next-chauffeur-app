"use client";
import { useState } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Car } from "@/types/admin";
import { Label } from "../ui/label";
import Image from "next/image";

type CarsTabProps = {
  cars: Car[];
  isLoadingCars: boolean;
  carError: string | null;
  fetchCars: () => Promise<void>;
};

export default function CarsTab({ cars, isLoadingCars, carError, fetchCars }: CarsTabProps) {
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [showEditCarModal, setShowEditCarModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [newCar, setNewCar] = useState({
    title: "",
    name: "",
    description: "",
    passengers: "",
    bags: "",
    wifi: false,
    meet_greet: false,
    drinks: false,
    waiting_time: "",
    base_price: 0,
    price_per_hour: 0,
    image_url: "",
  });
  const [newCarImage, setNewCarImage] = useState<File | null>(null);
  const [editCarImage, setEditCarImage] = useState<File | null>(null);

  const validateCarData = (car: {
    title: string;
    name: string;
    passengers: number;
    bags: number;
    waiting_time: string;
    base_price: number;
  }) => {
    return (
      car.title &&
      car.name &&
      car.passengers > 0 &&
      car.bags >= 0 &&
      car.waiting_time &&
      car.base_price > 0
    );
  };

  const resetNewCarForm = () => {
    setNewCar({
      title: "",
      name: "",
      description: "",
      passengers: "",
      bags: "",
      wifi: false,
      meet_greet: false,
      drinks: false,
      waiting_time: "",
      base_price: 0,
      price_per_hour: 0,
      image_url: "",
    });
    setNewCarImage(null);
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

  const handleAddCar = async () => {
    const passengers = parseInt(newCar.passengers);
    const bags = parseInt(newCar.bags);

    if (
      !newCar.title ||
      !newCar.name ||
      isNaN(passengers) ||
      passengers <= 0 ||
      isNaN(bags) ||
      bags < 0 ||
      !newCar.waiting_time ||
      newCar.base_price <= 0
    ) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    try {
      let imageUrl = "";
      if (newCarImage) {
        const fileExt = newCarImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from("vehicles")
          .upload(fileName, newCarImage);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: publicUrlData } = supabaseAdmin.storage
          .from("vehicles")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      const vehicleData = {
        ...newCar,
        passengers,
        bags,
        image_url: imageUrl || null,
        price_per_hour: newCar.price_per_hour || 0,
        created_at: new Date().toISOString()
      };

      const { error } = await supabaseAdmin.from("vehicles").insert(vehicleData);
      if (error) throw new Error(error.message);

      setShowAddCarModal(false);
      setNewCar({
        title: "",
        name: "",
        description: "",
        passengers: "",
        bags: "",
        wifi: false,
        meet_greet: false,
        drinks: false,
        waiting_time: "",
        price_per_hour: 0,
        base_price: 0,
        image_url: "",
      });
      setNewCarImage(null);
      await fetchCars();
      alert("Vehicle added successfully!");
    } catch (err: any) {
      console.error("Error adding vehicle:", err.message);
      alert(`Failed to add vehicle: ${err.message}`);
    }
  };


  const handleEditCar = async () => {
    if (!editingCar) {
      alert("No vehicle selected for editing.");
      return;
    }

    if (
      !editingCar.title ||
      !editingCar.name ||
      editingCar.passengers < 1 ||
      editingCar.bags < 0 ||
      !editingCar.waiting_time ||
      editingCar.base_price <= 0
    ) {
      alert("Please fill in all required fields correctly.");
      return;
    }

    try {
      let imageUrl = editingCar.image_url || "";

      // Handle image upload if a new image was selected
      if (editCarImage) {
        const fileExt = editCarImage.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;

        // Upload new image to storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from("vehicles")
          .upload(fileName, editCarImage);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        // Get public URL for the uploaded image
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("vehicles")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      }

      // Prepare update data (excluding internal fields)
      const { id, created_at, ...updateData } = editingCar;
      const vehicleData = {
        ...updateData,
        image_url: imageUrl || null
      };

      // Update the vehicle record in the database
      const { error } = await supabaseAdmin
        .from("vehicles")
        .update(vehicleData)
        .eq("id", id);

      if (error) throw new Error(error.message);

      // Reset state and refresh the list
      setShowEditCarModal(false);
      setEditingCar(null);
      setEditCarImage(null);
      await fetchCars();

      alert("Vehicle updated successfully!");
    } catch (err: any) {
      console.error("Error editing vehicle:", err);
      alert(`Failed to update vehicle: ${err.message}`);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    // Confirm deletion with user
    if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }

    try {
      // First attempt to delete any associated image from storage
      if (cars.find(car => car.id === carId)?.image_url) {
        const imagePath = cars.find(car => car.id === carId)?.image_url?.split('/').pop();
        if (imagePath) {
          const { error: storageError } = await supabaseAdmin.storage
            .from("vehicles")
            .remove([imagePath]);

          // We'll proceed with deletion even if image deletion fails
          if (storageError) {
            console.warn("Failed to delete associated image:", storageError.message);
          }
        }
      }

      // Delete the vehicle record from database
      const { error: deleteError } = await supabaseAdmin
        .from("vehicles")
        .delete()
        .eq("id", carId);

      if (deleteError) {
        throw new Error(`Database deletion failed: ${deleteError.message}`);
      }

      // Refresh the vehicle list
      await fetchCars();

      // Optional: Show toast notification instead of alert
      alert("Vehicle deleted successfully!");
    } catch (err: any) {
      console.error("Vehicle deletion error:", err);
      alert(`Deletion failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditClick = (car: Car) => {
    setEditingCar({
      ...car,
      title: car.title || "",
      name: car.name || "",
      description: car.description || "",
      passengers: car.passengers || 1,
      bags: car.bags || 0,
      wifi: car.wifi ?? false,
      meet_greet: car.meet_greet ?? false,
      drinks: car.drinks ?? false,
      waiting_time: car.waiting_time || "",
      base_price: car.base_price || 0,
      price_per_hour: car.price_per_hour || 0,
      image_url: car.image_url || "",
    });
    setShowEditCarModal(true);
  };

  // Common input fields for both add and edit modals
  const renderVehicleFormFields = (
    formData: typeof newCar | typeof editingCar,
    setFormData: React.Dispatch<any>,
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
          value={formData?.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      {/* Name Field */}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., Mercedes-Benz E-Class"
          value={formData?.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      {/* Description Field */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Vehicle description"
          value={formData?.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      {/* Capacity Fields */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="passengers">Passengers</Label>
          <Input
            id="passengers"
            type="number"
            min="1"
            placeholder="Number of passengers"
            value={formData?.passengers || ""}
            onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="bags">Bags</Label>
          <Input
            id="bags"
            type="number"
            min="0"
            placeholder="Number of bags"
            value={formData?.bags || ""}
            onChange={(e) => setFormData({ ...formData, bags: e.target.value })}
          />
        </div>
      </div>

      {/* Amenities Checkboxes */}
      <div className="flex gap-4">
        {['wifi', 'meet_greet', 'drinks'].map((amenity) => (
          <div key={amenity} className="flex items-center gap-2">
            <Checkbox
              id={amenity}
              checked={!!formData?.[amenity as keyof typeof formData]}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, [amenity]: !!checked })
              }
            />
            <Label htmlFor={amenity}>
              {amenity.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </Label>
          </div>
        ))}
      </div>

      {/* Pricing Fields */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="waiting_time">Waiting Time</Label>
          <Input
            id="waiting_time"
            placeholder="Waiting Time"
            value={formData?.waiting_time || ""}
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
            value={formData?.base_price || 0}
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
            value={formData?.price_per_hour || 0}
            onChange={(e) => setFormData({ ...formData, price_per_hour: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <Label htmlFor="vehicle_image">Vehicle Image</Label>
        {isEditMode && formData?.image_url && (
          <div className="mb-2">
            <img
              src={formData.image_url}
              alt="Current vehicle"
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
        <Button onClick={() => setShowAddCarModal(true)}>Add Vehicle</Button>
      </div>

      {isLoadingCars ? (
        <p className="text-center">Loading vehicles...</p>
      ) : carError ? (
        <p className="text-red-500 text-center">{carError}</p>
      ) : cars.length === 0 ? (
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
              {cars.map((car) => (
                <tr key={car.id} className="border-b">
                  <td className="p-2">
                    {car.image_url ? (
                      <Image
                        width={64}
                        height={64}
                        src={car.image_url}
                        alt={car.name}
                        className="object-cover"
                      />
                    ) : (
                      "No Image Here"
                    )}
                  </td>
                  <td className="p-2">{car.title}</td>
                  <td className="p-2">{car.name}</td>
                  <td className="p-2">{car.passengers}</td>
                  <td className="p-2">{car.bags}</td>
                  <td className="p-2">£{car.base_price.toFixed(2)}</td>
                  <td className="p-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(car)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCar(car.id)}
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

      {/* Add Vehicle Modal */}
      {showAddCarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Add New Vehicle</h3>
            {renderVehicleFormFields(newCar, setNewCar, newCarImage, setNewCarImage)}
            <ModalFooter
              onSave={handleAddCar}
              onCancel={() => {
                setShowAddCarModal(false);
                resetNewCarForm();
              }}
              saveLabel="Add Vehicle"
            />
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditCarModal && editingCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edit Vehicle</h3>
            {renderVehicleFormFields(editingCar, setEditingCar, editCarImage, setEditCarImage, true)}
            <ModalFooter
              onSave={handleEditCar}
              onCancel={() => {
                setShowEditCarModal(false);
                setEditingCar(null);
                setEditCarImage(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}