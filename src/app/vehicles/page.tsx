"use client";
import { useEffect, useState } from "react";
// import { Vehicle } from "@/types/admin";
import { fetchVehicles } from "@/lib/adminFetch";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Star } from "lucide-react";

// Static vehicle data for the vehicles page
const staticVehicles = [
  {
    id: "mercedes-s-class",
    title: "Mercedes-Benz S-Class",
    name: "S-Class Chauffeur Car",
    description: "Experience the pinnacle of automotive excellence with our flagship Mercedes-Benz S-Class.",
    image: "/images/cars/mercedes-s.jpeg",
    passengers: 4,
    bags: 3,
    base_price: 120,
    price_per_hour: 85,
    brand: "mercedes",
    model: "s-class",
    features: ["Heated & Ventilated Seats", "Ambient Lighting", "Premium Sound System"]
  },
  {
    id: "mercedes-v-class",
    title: "Mercedes-Benz V-Class",
    name: "Luxury V-Class",
    description: "The Mercedes-Benz V-Class offers spacious luxury for larger groups.",
    image: "/images/cars/v-class.jpeg",
    passengers: 7,
    bags: 5,
    base_price: 140,
    price_per_hour: 95,
    brand: "mercedes",
    model: "luxury-v-class",
    features: ["7-Seat Configuration", "Sliding Doors", "Premium Interior"]
  },
  {
    id: "range-rover-2022",
    title: "Range Rover Autobiography",
    name: "Autobiography 2022 Model",
    description: "The Range Rover Autobiography represents the ultimate in luxury SUV travel.",
    image: "/images/cars/range-rover.jpeg",
    passengers: 5,
    bags: 4,
    base_price: 150,
    price_per_hour: 100,
    brand: "range-rover",
    model: "autobiography-2022",
    features: ["All-Terrain Capability", "Premium Leather Interior", "Panoramic Roof"]
  },
  {
    id: "range-rover-2025",
    title: "Range Rover Autobiography",
    name: "Autobiography 2025 Model",
    description: "The latest Range Rover Autobiography model featuring cutting-edge technology.",
    image: "/images/cars/range-rover.jpeg",
    passengers: 5,
    bags: 4,
    base_price: 160,
    price_per_hour: 110,
    brand: "range-rover",
    model: "autobiography-2025",
    features: ["Latest Technology", "Enhanced Safety Features", "Premium Interior"]
  },
  {
    id: "13-seater",
    title: "13 Seater Luxury Vehicle",
    name: "13 Seater Executive Transport",
    description: "Our 13-seater luxury vehicle is perfect for large groups and corporate events.",
    image: "/images/cars/suv1.jpg",
    passengers: 13,
    bags: 8,
    base_price: 200,
    price_per_hour: 120,
    brand: "13-seater",
    model: "default",
    features: ["13-Seat Configuration", "Spacious Interior", "Climate Control"]
  }
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        // First try to get from Firestore
        const result = await fetchVehicles();
        if (result.data && result.data.length > 0) {
          // Filter active vehicles and map them to our route structure
          const activeVehicles = result.data
            .filter(v => v.vehicle_status === "active")
            .map(v => ({
              ...v,
              brand: v.id.toLowerCase().includes('mercedes') ? 'mercedes' : 
                     v.id.toLowerCase().includes('range') ? 'range-rover' : '13-seater',
              model: v.id.toLowerCase().includes('s-class') ? 's-class' :
                     v.id.toLowerCase().includes('v-class') ? 'luxury-v-class' :
                     v.id.toLowerCase().includes('2022') ? 'autobiography-2022' :
                     v.id.toLowerCase().includes('2025') ? 'autobiography-2025' : 'default'
            }));
          setVehicles(activeVehicles);
        } else {
          // Fallback to static data
          setVehicles(staticVehicles);
        }
        if (result.error) {
          console.warn("Firestore error, using static data:", result.error);
          setVehicles(staticVehicles);
        }
      } catch (err) {
        console.warn("Failed to load vehicles from Firestore, using static data:", err);
        setVehicles(staticVehicles);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading vehicles...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-xl">{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-serif text-white mb-6">
            Our <span className="text-yellow-400">Luxury Fleet</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Experience the finest collection of luxury vehicles, each meticulously maintained 
            and driven by professional chauffeurs for your ultimate comfort and satisfaction.
          </p>
        </div>
      </section>

      {/* Vehicles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => (
              <Link href={`/vehicles/${vehicle.brand}/${vehicle.model}`} key={vehicle.id}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={vehicle.image}
                      alt={vehicle.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-medium">View Details</p>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-yellow-600 transition-colors">
                      {vehicle.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">{vehicle.name}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 line-clamp-2">{vehicle.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-yellow-600" />
                        <span>{vehicle.passengers} Passengers</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-yellow-600" />
                        <span>{vehicle.bags} Bags</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600 text-sm">From</p>
                          <p className="text-2xl font-bold text-yellow-600">£{vehicle.base_price}</p>
                        </div>
                        <Button 
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-black"
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>

                    {vehicle.features && (
                      <div className="pt-4">
                        <div className="flex flex-wrap gap-2">
                          {vehicle.features.slice(0, 3).map((feature: string, index: number) => (
                            <div key={index} className="flex items-center space-x-1 text-xs text-gray-600">
                              <Star className="h-3 w-3 text-yellow-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Luxury?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Book your preferred vehicle today and enjoy the ultimate in luxury transportation 
            with our professional chauffeur service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-8 py-4"
              onClick={() => window.location.href = '/#estimate'}
            >
              Get a Quote
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 