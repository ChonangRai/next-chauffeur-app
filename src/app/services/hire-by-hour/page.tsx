import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Car, 
  Star, 
  ArrowRight,
  Clock,
  MapPin,
  Briefcase,
  CheckCircle,
  Calendar,
  Building2,
  Shield,
  Wifi,
  Coffee
} from 'lucide-react';
import { getVehicles } from '@/lib/firebase-admin';

export const metadata: Metadata = {
  title: "Hire a Chauffeur by the Hour | London Chauffeur Hire",
  description: "Flexible hourly chauffeur service in London. Hire a professional driver and luxury vehicle by the hour. Transparent pricing and premium experience.",
  metadataBase: new URL('https://londonchauffeurhire.com'),
  keywords: ['hire by hour', 'chauffeur service', 'luxury car hire', 'London chauffeur', 'hourly driver', 'business travel', 'city tours', 'VIP transport'],
  authors: [{ name: 'London Chauffeur Hire' }],
  openGraph: {
    title: "Hire a Chauffeur by the Hour | London Chauffeur Hire",
    description: "Flexible hourly chauffeur service in London. Hire a professional driver and luxury vehicle by the hour.",
    images: ['/images/corporate-travel.jpg'],
    type: 'website',
    locale: 'en_GB',
    siteName: 'London Chauffeur Hire',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hire a Chauffeur by the Hour | London Chauffeur Hire",
    description: "Flexible hourly chauffeur service in London. Hire a professional driver and luxury vehicle by the hour.",
    images: ['/images/corporate-travel.jpg'],
  },
};

const benefits = [
  { 
    icon: Clock, 
    title: "Full Control of Your Schedule",
    description: "Your journey, your timeline. Complete flexibility to go wherever you need, whenever you need."
  },
  { 
    icon: Briefcase, 
    title: "Ideal for Business & Personal",
    description: "Perfect for meetings, events, shopping trips, or simply exploring the city in comfort."
  },
  { 
    icon: Car, 
    title: "Wait-and-Return Service",
    description: "Your chauffeur waits while you attend meetings, shop, or dine. No parking worries."
  },
  { 
    icon: Shield, 
    title: "Comfort, Privacy & Professionalism",
    description: "Luxury vehicles with professional chauffeurs ensuring a premium experience."
  }
];

const howItWorks = [
  {
    icon: Car,
    title: "Choose Your Vehicle",
    description: "Select from our luxury fleet based on your needs and group size."
  },
  {
    icon: Clock,
    title: "Select Hours & Details",
    description: "Pick your duration, pickup location, and any special requirements."
  },
  {
    icon: CheckCircle,
    title: "Relax & Enjoy",
    description: "Your professional chauffeur handles everything while you focus on your journey."
  }
];

const useCases = [
  { icon: Briefcase, title: "Business Meetings", description: "Professional transport for executives and clients" },
  { icon: Building2, title: "Airport Standby", description: "Reliable waiting service for flight delays" },
  { icon: MapPin, title: "Shopping Trips", description: "Luxury transport for retail therapy" },
  { icon: Calendar, title: "Weddings & Events", description: "Special occasion transportation" },
  { icon: Star, title: "VIP Mobility", description: "Executive and celebrity transport" }
];

const testimonials = [
  {
    id: 1,
    name: "James R.",
    role: "Business Executive",
    content: "Flawless experience from start to finish. My driver was courteous, punctual, and professional. The hourly service gave me complete flexibility for my business meetings.",
    rating: 5,
    image: "/images/user-avatar.png"
  },
  {
    id: 2,
    name: "Alina P.",
    role: "Event Coordinator",
    content: "I had complete control over my journey without worrying about parking or waiting. Perfect for my shopping trips and city tours. Highly recommend!",
    rating: 5,
    image: "/images/user-avatar.png"
  }
];

export default async function HireByHourPage() {
  // Fetch vehicles from Firestore
  const vehicles = await getVehicles();
  
  // Filter active vehicles and calculate VAT-inclusive prices
  const activeVehicles = vehicles
    .filter(vehicle => vehicle.vehicle_status !== 'draft')
    .map(vehicle => ({
      ...vehicle,
      pricePerHourVAT: (vehicle.price_per_hour * 1.2).toFixed(2), // 20% VAT
      basePriceVAT: (vehicle.base_price * 1.2).toFixed(2) // 20% VAT
    }));

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/corporate-travel.jpg"
            alt="Hire by Hour Chauffeur Service"
            fill
            className="object-cover"
            sizes="100vw"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-serif text-white leading-tight">
                  Hire a Chauffeur
                  <span className="block text-yellow-400">by the Hour</span>
                  <span className="block text-3xl lg:text-4xl font-light text-slate-300">in London</span>
                </h1>
                <p className="text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                  Your journey. Your schedule. Our professional chauffeur.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-600 text-white hover:bg-yellow-700 font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/#estimate">
                    Book Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white hover:bg-white hover:text-yellow-600 px-8 py-4 rounded-none text-lg transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">
                    Get a Quote
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Right: Space for Image */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </section>

      {/* Why Hire by the Hour Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Why Hire by the Hour?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible hourly-based hire with a professional chauffeur at your disposal anywhere in London. 
              Perfect for business meetings, city tours, events, errands, or day trips.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Featured Vehicles</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our luxury fleet with transparent hourly pricing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="relative h-64">
                  <Image
                    src={vehicle.image_url || "/images/cars/mercedes-s.jpeg"}
                    alt={vehicle.title}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-yellow-600 text-white">
                      Max {vehicle.passengers} passengers / {vehicle.bags} bags
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{vehicle.title}</h3>
                  <p className="text-gray-600 mb-4">{vehicle.description}</p>
                  
                  {/* Pricing */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hourly Rate (inc. VAT)</span>
                      <span className="text-2xl font-bold text-yellow-600">£{vehicle.pricePerHourVAT}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-600">Base Price (inc. VAT)</span>
                      <span className="text-lg font-semibold text-gray-800">£{vehicle.basePriceVAT}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {vehicle.features && vehicle.features.slice(0, 4).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                    {vehicle.wifi && (
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-700">Free WiFi</span>
                      </div>
                    )}
                    {vehicle.drinks && (
                      <div className="flex items-center space-x-2">
                        <Coffee className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-700">Complimentary Drinks</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                    asChild
                  >
                    <Link href={`/vehicles/${vehicle.brand?.toLowerCase()}/${vehicle.model?.toLowerCase()}`}>
                      Book This Vehicle
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* VAT and Surcharge Notice */}
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              <strong>Note:</strong> All prices shown above include 20% VAT. Additional charges apply for unsocial hours (10 PM - 6 AM) and festive periods (Christmas, New Year, Easter).
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to your perfect hourly chauffeur service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Common Use Cases</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Perfect for any occasion where you need flexible, professional transportation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <useCase.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover rounded-full"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Ready for a Flexible, Premium Ride?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the convenience and luxury of our hourly chauffeur service. 
              Your schedule, your destination, our professional service.
            </p>
            <p className="text-lg text-yellow-400 font-medium">
              Transparent pricing • Professional chauffeurs • Luxury vehicles
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/#estimate">
                  Hire Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white hover:bg-yellow-600 hover:text-gray-900 px-8 py-4 rounded-none text-lg transition-all duration-300"
                asChild
              >
                <Link href="/vehicles">
                  See Vehicle Options
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 