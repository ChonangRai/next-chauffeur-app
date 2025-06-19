"use client";
import { useEffect, useState } from "react";
// import { Vehicle } from "@/types/admin";
import { fetchVehicles } from "@/lib/adminFetch";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users, Briefcase, Wifi, Coffee, Clock, Star } from "lucide-react";

// Vehicle data mapping for the car routes
const vehicleData = {
  "mercedes": {
    "s-class": {
      title: "Mercedes-Benz S-Class",
      name: "S-Class Chauffeur Car",
      description: "Experience the pinnacle of automotive excellence with our flagship Mercedes-Benz S-Class, where every journey becomes an occasion. This luxury sedan combines cutting-edge technology with unparalleled comfort, making it the perfect choice for business travel, airport transfers, and special events.",
      image: "/images/cars/mercedes-s.jpeg",
      passengers: 4,
      bags: 3,
      base_price: 120,
      price_per_hour: 85,
      wifi: true,
      drinks: true,
      waiting_time: "30 minutes",
      features: [
        "Heated & Ventilated Seats",
        "Ambient Lighting",
        "Premium Sound System",
        "Climate Control",
        "WiFi Hotspot",
        "Complimentary Refreshments"
      ],
      specifications: {
        engine: "3.0L 6-Cylinder",
        power: "362 hp",
        transmission: "9-Speed Automatic",
        fuel_type: "Petrol",
        seating: "4 Passengers",
        luggage: "3 Large Bags"
      }
    },
    "luxury-v-class": {
      title: "Mercedes-Benz V-Class",
      name: "Luxury V-Class",
      description: "The Mercedes-Benz V-Class offers spacious luxury for larger groups. Perfect for corporate events, airport transfers with multiple passengers, or family travel. This premium MPV combines the comfort of a luxury sedan with the practicality of a people carrier.",
      image: "/images/cars/v-class.jpeg",
      passengers: 7,
      bags: 5,
      base_price: 140,
      price_per_hour: 95,
      wifi: true,
      drinks: true,
      waiting_time: "30 minutes",
      features: [
        "7-Seat Configuration",
        "Sliding Doors",
        "Premium Interior",
        "Climate Control",
        "WiFi Hotspot",
        "Complimentary Refreshments"
      ],
      specifications: {
        engine: "2.0L 4-Cylinder",
        power: "163 hp",
        transmission: "9-Speed Automatic",
        fuel_type: "Diesel",
        seating: "7 Passengers",
        luggage: "5 Large Bags"
      }
    }
  },
  "range-rover": {
    "autobiography-2022": {
      title: "Range Rover Autobiography",
      name: "Autobiography 2022 Model",
      description: "The Range Rover Autobiography represents the ultimate in luxury SUV travel. With its commanding presence and sophisticated interior, this vehicle offers the perfect blend of off-road capability and on-road refinement for discerning clients.",
      image: "/images/cars/range-rover.jpeg",
      passengers: 5,
      bags: 4,
      base_price: 150,
      price_per_hour: 100,
      wifi: true,
      drinks: true,
      waiting_time: "30 minutes",
      features: [
        "All-Terrain Capability",
        "Premium Leather Interior",
        "Panoramic Roof",
        "Climate Control",
        "WiFi Hotspot",
        "Complimentary Refreshments"
      ],
      specifications: {
        engine: "3.0L 6-Cylinder",
        power: "395 hp",
        transmission: "8-Speed Automatic",
        fuel_type: "Petrol",
        seating: "5 Passengers",
        luggage: "4 Large Bags"
      }
    },
    "autobiography-2025": {
      title: "Range Rover Autobiography",
      name: "Autobiography 2025 Model",
      description: "The latest Range Rover Autobiography model featuring cutting-edge technology and enhanced luxury features. This state-of-the-art SUV delivers an unparalleled driving experience with advanced driver assistance systems and premium comfort.",
      image: "/images/cars/range-rover.jpeg",
      passengers: 5,
      bags: 4,
      base_price: 160,
      price_per_hour: 110,
      wifi: true,
      drinks: true,
      waiting_time: "30 minutes",
      features: [
        "Latest Technology",
        "Enhanced Safety Features",
        "Premium Interior",
        "Climate Control",
        "WiFi Hotspot",
        "Complimentary Refreshments"
      ],
      specifications: {
        engine: "3.0L 6-Cylinder",
        power: "395 hp",
        transmission: "8-Speed Automatic",
        fuel_type: "Petrol",
        seating: "5 Passengers",
        luggage: "4 Large Bags"
      }
    }
  },
  "13-seater": {
    "default": {
      title: "13 Seater Luxury Vehicle",
      name: "13 Seater Executive Transport",
      description: "Our 13-seater luxury vehicle is perfect for large groups, corporate events, and airport transfers. This spacious vehicle ensures everyone travels in comfort while maintaining the high standards of our chauffeur service.",
      image: "/images/cars/suv1.jpg",
      passengers: 13,
      bags: 8,
      base_price: 200,
      price_per_hour: 120,
      wifi: true,
      drinks: true,
      waiting_time: "30 minutes",
      features: [
        "13-Seat Configuration",
        "Spacious Interior",
        "Climate Control",
        "WiFi Hotspot",
        "Complimentary Refreshments",
        "Luggage Space"
      ],
      specifications: {
        engine: "3.0L 6-Cylinder",
        power: "300 hp",
        transmission: "Automatic",
        fuel_type: "Diesel",
        seating: "13 Passengers",
        luggage: "8 Large Bags"
      }
    }
  }
};

export default function CarPage({ params }: { params: { brand: string; model: string } }) {
  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        // First try to get from our static data
        const brandData = vehicleData[params.brand as keyof typeof vehicleData];
        if (brandData) {
          const modelData = brandData[params.model as keyof typeof brandData];
          if (modelData) {
            setVehicle(modelData);
            setIsLoading(false);
            return;
          }
        }

        // If not found in static data, try to fetch from Firestore
        const result = await fetchVehicles();
        if (result.data) {
          // Create a slug from brand and model
          const searchSlug = `${params.brand}-${params.model}`.toLowerCase();
          const foundVehicle = result.data.find(v => 
            v.id.toLowerCase().includes(searchSlug) || 
            v.title.toLowerCase().includes(searchSlug)
          );
          if (foundVehicle) {
            setVehicle(foundVehicle);
          } else {
            setError("Vehicle not found");
          }
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
          onClick={() => router.push('/fleet')}
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
          onClick={() => router.push('/fleet')}
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
            src={vehicle.image}
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
                  Book This Car
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-none text-lg transition-all duration-300"
                  onClick={() => router.push('/contact')}
                >
                  Get a Quote
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
                src={vehicle.image}
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
              {vehicle.features && (
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
                      <div key={key}>
                        <p className="text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                        <p className="font-semibold">{value as string}</p>
                      </div>
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
                  onClick={() => router.push('/fleet')}
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