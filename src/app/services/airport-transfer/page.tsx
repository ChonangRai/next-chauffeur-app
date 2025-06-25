import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, 
  Star, 
  ArrowRight,
  Clock,
  Users,
  Plane,
  CheckCircle,
  Calendar,
  Building2,
  MapPin,
  Shield,
  Clock3,
  Zap
} from 'lucide-react';
import { getServiceRates } from '@/lib/firebase-admin';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Airport Transfer Service in London | London Chauffeur Hire',
    description: 'Professional airport transfer service in London. Hotel to airport, airport to hotel, and inter-airport transfers. Luxury vehicles, real-time tracking, and 24/7 availability.',
    metadataBase: new URL('https://londonchauffeurhire.com'),
    keywords: ['airport transfer', 'chauffeur service', 'London airport', 'Heathrow transfer', 'Gatwick transfer', 'Stansted transfer', 'Luton transfer', 'London City airport', 'luxury transportation'],
    authors: [{ name: 'London Chauffeur Hire' }],
    openGraph: {
      title: 'Airport Transfer Service in London | London Chauffeur Hire',
      description: 'Professional airport transfer service in London. Hotel to airport, airport to hotel, and inter-airport transfers.',
      images: ['/images/airport-transfer.jpg'],
      type: 'website',
      locale: 'en_GB',
      siteName: 'London Chauffeur Hire',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Airport Transfer Service in London | London Chauffeur Hire',
      description: 'Professional airport transfer service in London. Hotel to airport, airport to hotel, and inter-airport transfers.',
      images: ['/images/airport-transfer.jpg'],
    },
  };
}

const airports = [
  { name: "Heathrow Airport (LHR)", code: "LHR", icon: Building2 },
  { name: "Gatwick Airport (LGW)", code: "LGW", icon: Building2 },
  { name: "Stansted Airport (STN)", code: "STN", icon: Building2 },
  { name: "Luton Airport (LTN)", code: "LTN", icon: Building2 },
  { name: "London City Airport (LCY)", code: "LCY", icon: Building2 }
];

const serviceTypes = [
  {
    icon: Plane,
    title: "Hotel to Airport",
    description: "Reliable transfers from any London hotel to any London airport with flight monitoring and flexible pickup times."
  },
  {
    icon: Plane,
    title: "Airport to Hotel",
    description: "Meet & greet service at arrivals with luggage assistance and direct transfer to your London accommodation."
  },
  {
    icon: Plane,
    title: "Inter-Airport Transfers",
    description: "Seamless connections between London airports for connecting flights or multi-destination travel."
  }
];

const journeySteps = [
  {
    icon: Calendar,
    title: "Book Your Transfer",
    description: "Choose your pickup and dropoff locations, select your preferred vehicle, and confirm your booking online."
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Receive live updates about your driver's location and estimated arrival time via SMS and email."
  },
  {
    icon: CheckCircle,
    title: "Enjoy Your Journey",
    description: "Relax in luxury while our professional chauffeur handles your journey with care and attention."
  }
];

const benefits = [
  { icon: Shield, text: "Fully licensed and insured vehicles" },
  { icon: Clock3, text: "24/7 availability with flight monitoring" },
  { icon: Users, text: "Professional, uniformed chauffeurs" },
  { icon: Car, text: "Luxury vehicles with modern amenities" },
  { icon: MapPin, text: "Real-time GPS tracking" },
  { icon: Zap, text: "Fixed pricing with no hidden charges" }
];

const constraints = [
  { item: "Maximum Passengers", value: "7 passengers", notes: "Including children" },
  { item: "Maximum Luggage", value: "3 large bags", notes: "Plus hand luggage" },
  { item: "Unsocial Hours", value: "10 PM - 6 AM", notes: "Additional charges apply" },
  { item: "Festive Periods", value: "2x Price", notes: "December 24, December 25, December 26, December 31 & January 1" }
];

const testimonials = [
  {
    id: 1,
    name: "David Thompson",
    role: "Business Traveler",
    content: "The airport transfer service was exceptional. My driver was waiting with a name board, helped with luggage, and got me to my meeting on time despite heavy traffic.",
    rating: 5,
    image: "/images/user-avatar.png"
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    role: "Family Traveler",
    content: "Traveling with two young children was made so much easier with their spacious vehicle and helpful driver. Highly recommend for families.",
    rating: 5,
    image: "/images/user-avatar.png"
  },
  {
    id: 3,
    name: "James Wilson",
    role: "Frequent Flyer",
    content: "I use their airport transfer service regularly for business trips. Always punctual, professional, and the vehicles are immaculate.",
    rating: 5,
    image: "/images/user-avatar.png"
  }
];

export default async function AirportTransferPage() {
  // Fetch service rates from Firestore
  const serviceRates = await getServiceRates();
  
  // Extract specific rates
  const baseRate = serviceRates.find(rate => rate.id === 'airport-transfer-base')?.baseRate;
  const connectionRate = serviceRates.find(rate => rate.id === 'airport-transfer-connection')?.baseRate;
  const lhrRate = serviceRates.find(rate => rate.id === 'airport-transfer-lhr')?.baseRate;
  const otherRate = serviceRates.find(rate => rate.id === 'airport-transfer-other')?.baseRate;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/airport-transfer.jpg"
            alt="Airport Transfer Service"
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
                  Airport Transfer
                  <span className="block text-yellow-400">Service</span>
                  <span className="block text-3xl lg:text-4xl font-light text-slate-300">in London</span>
                </h1>
                <p className="text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                  Seamless Transfers Between Hotels and All London Airports
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-600 text-white hover:bg-yellow-700 font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/#estimate">
                    Book Your Transfer
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

      {/* Introduction Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8">
              Experience stress-free airport transfers across London with our professional chauffeur service. Whether you're heading to the airport or arriving in the city, we provide reliable, luxury transportation with real-time flight monitoring and flexible scheduling.
            </p>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">We serve all major London airports:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {airports.map((airport, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                    <airport.icon className="h-6 w-6 text-yellow-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{airport.name}</h3>
                      <p className="text-sm text-gray-600">Code: {airport.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Our Airport Transfer Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive transfer solutions for all your airport transportation needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceTypes.map((service, index) => (
              <Card key={index} className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Your Journey Simplified</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to your perfect airport transfer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journeySteps.map((step, index) => (
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

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">Why Choose Our Airport Transfer Service?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Experience the difference with our professional, reliable, and luxurious airport transfer service.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                      <benefit.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative h-[500px] w-full">
              <Image
                src="/images/airport-transfer.jpg"
                alt="Luxury Airport Transfer"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dynamic rates updated in real-time from our pricing system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Same Airport</h3>
                <p className="text-3xl font-bold text-yellow-600">£{baseRate}</p>
                <p className="text-sm text-gray-600">Base rate</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Inter-Airport</h3>
                <p className="text-3xl font-bold text-yellow-600">£{connectionRate}</p>
                <p className="text-sm text-gray-600">Base rate</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Heathrow (LHR)</h3>
                <p className="text-3xl font-bold text-yellow-600">£{lhrRate}</p>
                <p className="text-sm text-gray-600">Hotel transfers</p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">Other Airports</h3>
                <p className="text-3xl font-bold text-yellow-600">£{otherRate}</p>
                <p className="text-sm text-gray-600">Hotel transfers</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Service Constraint</th>
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Limit</th>
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {constraints.map((constraint, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-6 py-4 font-medium">{constraint.item}</td>
                    <td className="border border-gray-200 px-6 py-4 text-yellow-600 font-semibold">{constraint.value}</td>
                    <td className="border border-gray-200 px-6 py-4 text-gray-600">{constraint.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> All prices shown above are exclusive of 20% VAT. Final pricing will include applicable VAT charges and any additional fees for unsocial hours or festive periods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Call to Action Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white">
              Book Your Airport Transfer Today
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the convenience and luxury of our professional airport transfer service. 
              From hotel to airport, airport to hotel, or between airports - we've got you covered.
            </p>
            <p className="text-lg text-yellow-400 font-medium">
              Real-time pricing • 24/7 availability • Professional service
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
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
                className="border-white hover:bg-yellow-600 hover:text-gray-900 px-8 py-4 rounded-none text-lg transition-all duration-300"
                asChild
              >
                <Link href="/contact">
                  Get a Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
