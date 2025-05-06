"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Location {
  id: number;
  name: string;
  status: "active" | "inactive";
}

interface ServicePricing {
  id: number;
  service_type: string;
  sub_type: string;
  base_price: number;
}

interface ExtraCharge {
  id: number;
  charge_type: string;
  amount: number;
}

interface FetchResult<T> {
  data: T[] | null;
  error: string | null;
  isLoading: boolean;
}

export default function PriceSettingsTab({
  fetchLocations,
  fetchServicePricing,
  fetchExtraCharges,
}: {
  fetchLocations: () => Promise<FetchResult<Location>>;
  fetchServicePricing: () => Promise<FetchResult<ServicePricing>>;
  fetchExtraCharges: () => Promise<FetchResult<ExtraCharge>>;
}) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({ name: "", status: "active" });

  const [servicePricing, setServicePricing] = useState<ServicePricing[]>([]);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [newPricing, setNewPricing] = useState({
    service_type: "",
    sub_type: "",
    base_price: 0,
  });

  const [extraCharges, setExtraCharges] = useState<ExtraCharge[]>([]);
  const [isLoadingCharges, setIsLoadingCharges] = useState(true);
  const [chargeError, setChargeError] = useState<string | null>(null);
  const [newExtraCharge, setNewExtraCharge] = useState({
    charge_type: "",
    amount: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [locationsRes, pricingRes, chargesRes] = await Promise.all([
      fetchLocations(),
      fetchServicePricing(),
      fetchExtraCharges(),
    ]);
    setLocations(locationsRes.data || []);
    setLocationError(locationsRes.error);
    setIsLoadingLocations(locationsRes.isLoading);
    setServicePricing(pricingRes.data || []);
    setPricingError(pricingRes.error);
    setIsLoadingPricing(pricingRes.isLoading);
    setExtraCharges(chargesRes.data || []);
    setChargeError(chargesRes.error);
    setIsLoadingCharges(chargesRes.isLoading);
  };

  const addLocation = async () => {
    if (!newLocation.name) return;
    const response = await fetch("/api/admin/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLocation),
    });
    const result = await response.json();
    if (!response.ok) {
      setLocationError(result.error || "Failed to add location");
      return;
    }
    setNewLocation({ name: "", status: "active" });
    fetchData();
  };

  const updateLocationStatus = async (id: number, status: "active" | "inactive") => {
    const response = await fetch(`/api/admin/locations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const result = await response.json();
    if (!response.ok) {
      setLocationError(result.error || "Failed to update status");
      return;
    }
    fetchData();
  };

  const addServicePricing = async () => {
    if (!newPricing.service_type || !newPricing.sub_type || newPricing.base_price <= 0) return;
    const response = await fetch("/api/admin/service-pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPricing),
    });
    const result = await response.json();
    if (!response.ok) {
      setPricingError(result.error || "Failed to add pricing");
      return;
    }
    setNewPricing({ service_type: "", sub_type: "", base_price: 0 });
    fetchData();
  };

  const updateServicePricing = async (id: number, base_price: number) => {
    const response = await fetch(`/api/admin/service-pricing/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base_price }),
    });
    const result = await response.json();
    if (!response.ok) {
      setPricingError(result.error || "Failed to update pricing");
      return;
    }
    fetchData();
  };

  const addExtraCharge = async () => {
    if (!newExtraCharge.charge_type || newExtraCharge.amount <= 0) return;
    const response = await fetch("/api/admin/extra-charges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExtraCharge),
    });
    const result = await response.json();
    if (!response.ok) {
      setChargeError(result.error || "Failed to add charge");
      return;
    }
    setNewExtraCharge({ charge_type: "", amount: 0 });
    fetchData();
  };

  const updateExtraCharge = async (id: number, amount: number) => {
    const response = await fetch(`/api/admin/extra-charges/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const result = await response.json();
    if (!response.ok) {
      setChargeError(result.error || "Failed to update charge");
      return;
    }
    fetchData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="New Location Name"
              value={newLocation.name}
              onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            />
            <Select
              value={newLocation.status}
              onValueChange={(value) => setNewLocation({ ...newLocation, status: value as "active" | "inactive" })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addLocation}>Add Location</Button>
          </div>
          {locationError && <p className="text-red-500">{locationError}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>{location.name}</TableCell>
                  <TableCell>
                    <Select
                      value={location.status}
                      onValueChange={(value) => updateLocationStatus(location.id, value as "active" | "inactive")}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {/* Optionally add delete button */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Service Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Service Type (e.g., meetAndGreet)"
              value={newPricing.service_type}
              onChange={(e) => setNewPricing({ ...newPricing, service_type: e.target.value })}
            />
            <Input
              placeholder="Sub Type (e.g., arrival)"
              value={newPricing.sub_type}
              onChange={(e) => setNewPricing({ ...newPricing, sub_type: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Base Price"
              value={newPricing.base_price || ""}
              onChange={(e) => setNewPricing({ ...newPricing, base_price: parseFloat(e.target.value) || 0 })}
            />
            <Button onClick={addServicePricing}>Add Pricing</Button>
          </div>
          {pricingError && <p className="text-red-500">{pricingError}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Type</TableHead>
                <TableHead>Sub Type</TableHead>
                <TableHead>Base Price (£)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicePricing.map((pricing) => (
                <TableRow key={pricing.id}>
                  <TableCell>{pricing.service_type}</TableCell>
                  <TableCell>{pricing.sub_type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={pricing.base_price}
                      onChange={(e) => updateServicePricing(pricing.id, parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    {/* Optionally add delete button */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Extra Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Charge Type (e.g., unsocial_hours)"
              value={newExtraCharge.charge_type}
              onChange={(e) => setNewExtraCharge({ ...newExtraCharge, charge_type: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Amount (£)"
              value={newExtraCharge.amount || ""}
              onChange={(e) => setNewExtraCharge({ ...newExtraCharge, amount: parseFloat(e.target.value) || 0 })}
            />
            <Button onClick={addExtraCharge}>Add Charge</Button>
          </div>
          {chargeError && <p className="text-red-500">{chargeError}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Charge Type</TableHead>
                <TableHead>Amount (£)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extraCharges.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell>{charge.charge_type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={charge.amount}
                      onChange={(e) => updateExtraCharge(charge.id, parseFloat(e.target.value) || 0)}
                    />
                  </TableCell>
                  <TableCell>
                    {/* Optionally add delete button */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}