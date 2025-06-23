"use client";
import { useEffect, useState } from "react";
import { Vehicle } from "@/types/admin";
import { fetchVehicles } from "@/lib/adminFetch";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users, Briefcase, Wifi, Coffee, Clock, Star } from "lucide-react";

export default function VehiclePage({ params }: { params: { brand: string; model: string } }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const result = await fetchVehicles();
        if (result.data && result.data.length > 0) {
          // Find vehicle by brand and model, ignoring case and checking the correct status field.
          const foundVehicle = result.data.find(
            (v) =>
              v.brand?.toLowerCase() === params.brand.toLowerCase() &&
              v.model?.toLowerCase() === params.model.toLowerCase() &&
              v.vehicle_status !== "draft"
          );
          
          if (foundVehicle) {
            setVehicle(foundVehicle);
          } else {
            setError("Vehicle not found or not available");
          }
        } else {
          setError("No vehicles found");
        }
        if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load vehicle details");
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicle();
  }, [params.brand, params.model]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading vehicle details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-xl">{error}</p>
        <Button 
          onClick={() => router.push('/vehicles')}
          className="mt-4"
        >
          View All Vehicles
        </Button>
      </div>
    </div>
  );

  if (!vehicle) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 text-xl">Vehicle not found</p>
        <Button 
          onClick={() => router.push('/vehicles')}
          className="mt-4"
        >
          View All Vehicles
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={vehicle.image_url || "/images/cars/mercedes-s.jpeg"}
            alt={vehicle.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center lg:text-left">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-serif text-white leading-tight">
                  {vehicle.title.split(' ')[0]}
                  <span className="block text-yellow-400">{vehicle.title.split(' ').slice(1).join(' ')}</span>
                  <span className="block text-3xl lg:text-4xl font-light">Chauffeur Car</span>
                </h1>
                <p className="text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                  Luxury. Comfort. Prestige.
                </p>
                <p className="text-lg text-slate-400 max-w-2xl">
                  {vehicle.description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/?vehicle=${params.brand}-${params.model}&service_type=hire_by_hour#estimate`)}
                >
                  Book This Vehicle
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-yellow-600 hover:bg-gray-300 hover:text-black px-8 py-4 rounded-none text-lg transition-all duration-300"
                  onClick={() => router.push('/contact')}
                >
                  Get a Bespoke Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle Details Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Vehicle Image */}
            <div className="relative h-[500px] w-full">
              <Image
                src={vehicle.image_url || "/images/cars/mercedes-s.jpeg"}
                alt={vehicle.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Vehicle Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">{vehicle.title}</h2>
                <p className="text-gray-600 text-lg">{vehicle.description}</p>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Users className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold">{vehicle.passengers} Passengers</p>
                    <p className="text-sm text-gray-500">Maximum capacity</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold">{vehicle.bags} Bags</p>
                    <p className="text-sm text-gray-500">Luggage space</p>
                  </div>
                </div>
                {vehicle.wifi && (
                  <div className="flex items-center space-x-3">
                    <Wifi className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold">Free WiFi</p>
                      <p className="text-sm text-gray-500">Stay connected</p>
                    </div>
                  </div>
                )}
                {vehicle.drinks && (
                  <div className="flex items-center space-x-3">
                    <Coffee className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold">Complimentary Drinks</p>
                      <p className="text-sm text-gray-500">Refreshments included</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                  <div>
                    <p className="font-semibold">{vehicle.waiting_time}</p>
                    <p className="text-sm text-gray-500">Waiting time</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4">Pricing</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600">Base Price</p>
                    <p className="text-3xl font-bold text-yellow-600">£{vehicle.base_price}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Per Hour Rate</p>
                    <p className="text-3xl font-bold text-yellow-600">£{vehicle.price_per_hour}</p>
                  </div>
                </div>
              </div>

              {/* Features List */}
              {vehicle.features && vehicle.features.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vehicle.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-600" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {vehicle.specifications && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(vehicle.specifications).map(([key, value]) => (
                      value && (
                        <div key={key}>
                          <p className="text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                          <p className="font-semibold">{value as string}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                  onClick={() => router.push(`/?vehicle=${params.brand}-${params.model}&service_type=hire_by_hour#estimate`)}
                >
                  Book This Vehicle
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-none text-lg transition-all duration-300"
                  onClick={() => router.push('/vehicles')}
                >
                  View All Vehicles
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 