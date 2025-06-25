import { Metadata } from 'next';
import { getVehicles } from "@/lib/firebase-admin";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Wifi, Coffee, Clock, Star } from "lucide-react";
import Link from "next/link";

// Generate metadata for the vehicle page
export async function generateMetadata({ 
  params 
}: { 
  params: { brand: string; model: string } 
}): Promise<Metadata> {
  try {
    const vehicles = await getVehicles();
    const vehicle = vehicles.find(
      (v) =>
        v.brand?.toLowerCase() === params.brand.toLowerCase() &&
        v.model?.toLowerCase() === params.model.toLowerCase() &&
        v.vehicle_status !== "draft"
    );

    if (!vehicle) {
      return {
        title: "Vehicle Not Found | London Chauffeur Hire",
        description: "The requested vehicle could not be found. Browse our luxury fleet of chauffeur vehicles.",
      };
    }

    const title = `${vehicle.title} Chauffeur Service | London Chauffeur Hire`;
    const description = `${vehicle.title} luxury chauffeur service in London. ${vehicle.description} Perfect for ${vehicle.passengers} passengers with ${vehicle.bags} bags. Professional chauffeur service with transparent pricing.`;

    return {
      title,
      description,
      metadataBase: new URL('https://londonchauffeurhire.com'),
      keywords: [
        vehicle.title.toLowerCase(),
        'chauffeur service',
        'luxury car hire',
        'London chauffeur',
        vehicle.brand?.toLowerCase() || '',
        vehicle.model?.toLowerCase() || '',
        'professional driver',
        'airport transfer',
        'hire by hour'
      ].filter(Boolean),
      authors: [{ name: 'London Chauffeur Hire' }],
      openGraph: {
        title,
        description,
        images: [vehicle.image_url || '/images/cars/mercedes-s.jpeg'],
        type: 'website',
        locale: 'en_GB',
        siteName: 'London Chauffeur Hire',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [vehicle.image_url || '/images/cars/mercedes-s.jpeg'],
      },
      alternates: {
        canonical: `https://londonchauffeurhire.com/vehicles/${params.brand}/${params.model}`,
      },
    };
  } catch (error) {
    return {
      title: "Vehicle Details | London Chauffeur Hire",
      description: "Luxury chauffeur service in London. Professional drivers and premium vehicles for all your transportation needs.",
    };
  }
}

export default async function VehiclePage({ params }: { params: { brand: string; model: string } }) {
  try {
    const vehicles = await getVehicles();
    const vehicle = vehicles.find(
      (v) =>
        v.brand?.toLowerCase() === params.brand.toLowerCase() &&
        v.model?.toLowerCase() === params.model.toLowerCase() &&
        v.vehicle_status !== "draft"
    );

    if (!vehicle) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 text-xl">Vehicle not found or not available</p>
            <Button asChild className="mt-4">
              <Link href="/vehicles">View All Vehicles</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={vehicle.image_url || "/images/cars/mercedes-s.jpeg"}
              alt={vehicle.title}
              fill
              className="object-cover"
              sizes="100vw"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6 sm:space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-serif text-white leading-tight">
                    {vehicle.title.split(' ')[0]}
                    <span className="block text-yellow-400">{vehicle.title.split(' ').slice(1).join(' ')}</span>
                    <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light">Chauffeur Car</span>
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                    Luxury. Comfort. Prestige.
                  </p>
                  <p className="text-base sm:text-lg text-slate-400 max-w-2xl">
                    {vehicle.description}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link href={`/?vehicle=${params.brand}-${params.model}&service_type=hire_by_hour#estimate`}>
                      Book This Vehicle
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-yellow-600 hover:bg-gray-300 hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300"
                    asChild
                  >
                    <Link href="/contact">
                      Get a Bespoke Quote
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vehicle Details Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Vehicle Image */}
              <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full">
                <Image
                  src={vehicle.image_url || "/images/cars/mercedes-s.jpeg"}
                  alt={vehicle.title}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Vehicle Information */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-4">{vehicle.title}</h2>
                  <p className="text-gray-600 text-base sm:text-lg">{vehicle.description}</p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{vehicle.passengers} Passengers</p>
                      <p className="text-xs sm:text-sm text-gray-500">Maximum capacity</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{vehicle.bags} Bags</p>
                      <p className="text-xs sm:text-sm text-gray-500">Luggage space</p>
                    </div>
                  </div>
                  {vehicle.wifi && (
                    <div className="flex items-center space-x-3">
                      <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Free WiFi</p>
                        <p className="text-xs sm:text-sm text-gray-500">Stay connected</p>
                      </div>
                    </div>
                  )}
                  {vehicle.drinks && (
                    <div className="flex items-center space-x-3">
                      <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Complimentary Drinks</p>
                        <p className="text-xs sm:text-sm text-gray-500">Refreshments included</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-sm sm:text-base">{vehicle.waiting_time}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Waiting time</p>
                    </div>
                  </div>
                  {vehicle.meet_greet && (
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-sm sm:text-base">Meet & Greet</p>
                        <p className="text-xs sm:text-sm text-gray-500">Professional service</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Information */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4">Pricing Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Base Price (inc. VAT)</span>
                      <span className="font-semibold text-sm sm:text-base">£{(vehicle.base_price * 1.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Hourly Rate (inc. VAT)</span>
                      <span className="font-semibold text-sm sm:text-base">£{(vehicle.price_per_hour * 1.2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm sm:text-base">Daily Rate (inc. VAT)</span>
                      <span className="font-semibold text-sm sm:text-base">£{(vehicle.daily_rate * 1.2).toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-4">
                    * All prices include 20% VAT. Additional charges may apply for unsocial hours and festive periods.
                  </p>
                </div>

                {/* Vehicle Features */}
                {vehicle.features && vehicle.features.length > 0 && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Vehicle Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vehicle.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                          <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Specifications */}
                {vehicle.specifications && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4">Technical Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicle.specifications.engine && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Engine</p>
                          <p className="font-medium text-sm sm:text-base">{vehicle.specifications.engine}</p>
                        </div>
                      )}
                      {vehicle.specifications.power && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Power</p>
                          <p className="font-medium text-sm sm:text-base">{vehicle.specifications.power}</p>
                        </div>
                      )}
                      {vehicle.specifications.transmission && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Transmission</p>
                          <p className="font-medium text-sm sm:text-base">{vehicle.specifications.transmission}</p>
                        </div>
                      )}
                      {vehicle.specifications.fuel_type && (
                        <div>
                          <p className="text-xs sm:text-sm text-gray-500">Fuel Type</p>
                          <p className="font-medium text-sm sm:text-base">{vehicle.specifications.fuel_type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 sm:space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Ready to Experience Luxury?
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                Book your {vehicle.title} chauffeur service today and experience the ultimate in comfort and style.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href={`/?vehicle=${params.brand}-${params.model}&service_type=hire_by_hour#estimate`}>
                    Book Now
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-yellow-600 hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl">Failed to load vehicle details</p>
          <Button asChild className="mt-4">
            <Link href="/vehicles">View All Vehicles</Link>
          </Button>
        </div>
      </div>
    );
  }
} 