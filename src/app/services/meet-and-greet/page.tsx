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
  Clock3
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meet and Greet Airport Assistance in London | London Chauffeur Hire',
  description: 'Professional airport meet & greet service with personalized welcome, real-time flight tracking, and luxury buggy ride options. Available at all major London airports.',
  metadataBase: new URL('https://londonchauffeurhire.com'),
  keywords: ['airport meet and greet', 'chauffeur service', 'airport transfer', 'luxury transportation', 'London chauffeur', 'Heathrow', 'Gatwick', 'Stansted', 'Luton', 'London City'],
  authors: [{ name: 'London Chauffeur Hire' }],
  openGraph: {
    title: 'Meet and Greet Airport Assistance in London | London Chauffeur Hire',
    description: 'Professional airport meet & greet service with personalized welcome, real-time flight tracking, and luxury buggy ride options.',
    images: ['/images/meet-and-greet/greeter.jpeg'],
    type: 'website',
    locale: 'en_GB',
    siteName: 'London Chauffeur Hire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meet and Greet Airport Assistance in London | London Chauffeur Hire',
    description: 'Professional airport meet & greet service with personalized welcome, real-time flight tracking, and luxury buggy ride options.',
    images: ['/images/meet-and-greet/greeter.jpeg'],
  },
};

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Business Executive",
    content: "The meet & greet service was exceptional. My greeter was waiting with my name on a board, helped with my luggage, and made the entire airport experience seamless.",
    rating: 5,
    image: "/images/user-avatar.png"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "International Traveler",
    content: "After a long flight, having someone meet me at the terminal was a game-changer. The buggy ride to the car was a nice luxury touch.",
    rating: 5,
    image: "/images/user-avatar.png"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Frequent Flyer",
    content: "Professional, punctual, and personalized service. The real-time flight tracking meant they were always there when I needed them.",
    rating: 5,
    image: "/images/user-avatar.png"
  }
];

const airports = [
  { name: "Heathrow Airport", terminals: "Terminals 2, 3, 4, 5", icon: Building2 },
  { name: "Gatwick Airport", terminals: "North & South Terminals", icon: Building2 },
  { name: "Stansted Airport", terminals: "Main Terminal", icon: Building2 },
  { name: "Luton Airport", terminals: "Main Terminal", icon: Building2 },
  { name: "London City Airport", terminals: "Main Terminal", icon: Building2 }
];

const serviceTypes = [
  {
    icon: Plane,
    title: "Arrival Meet & Greet",
    description: "Your greeter will be waiting at the arrivals hall with a name board, assist with luggage, and guide you through airport procedures swiftly."
  },
  {
    icon: Plane,
    title: "Departure Meet & Greet",
    description: "From curbside to check-in, your greeter will ensure a smooth experience — helping with luggage, security navigation, and last-minute requirements."
  },
  {
    icon: Plane,
    title: "Connection Meet & Greet",
    description: "Ideal for travelers connecting flights, including same terminal transfers and inter-terminal transfers at Heathrow with optional buggy and porter services."
  }
];

const whoFor = [
  { icon: Users, text: "Business travellers on tight schedules" },
  { icon: Users, text: "Families needing extra support with children" },
  { icon: Users, text: "Senior citizens or elderly passengers" },
  { icon: Users, text: "VIP guests seeking privacy and efficiency" },
  { icon: Users, text: "Tourists unfamiliar with London airports" },
  { icon: Users, text: "Groups or travellers with multiple bags" }
];

const whatsIncluded = [
  { icon: Clock, text: "Personal greeter assistance for up to 2 hours" },
  { icon: Users, text: "Covers up to 2 people" },
  { icon: CheckCircle, text: "Assistance through airport formalities" },
  { icon: Car, text: "Optional porter and buggy services (based on availability)" },
  { icon: Clock3, text: "Real-time flight monitoring and coordination" },
  { icon: Calendar, text: "Available at all hours, 365 days a year" }
];

const pricing = [
  { item: "Standard Service (up to 2 hours, 2 people)", price: "Custom Estimate", notes: "Pricing based on airport and service type" },
  { item: "Extra Hours", price: "£50", notes: "Per hour" },
  { item: "Additional Person", price: "£45", notes: "Per person" },
  { item: "Unsocial Hours Fee (10 PM - 6 AM)", price: "£60", notes: "Flat rate" },
  { item: "Festive Period Surcharge", price: "2x Price", notes: "Applies on Good Friday, December 24, December 25, December 26, December 31 & January 1" },
  { item: "Child under 6 months", price: "Free", notes: "Not counted as additional" },
  { item: "Buggy Service (Heathrow T2, T3, T4)", price: "£80", notes: "4-seater or 6-seater, subject to availability" },
  { item: "Porter Service", price: "£65", notes: "One porter per 8 bags" }
];

const whyBookWithUs = [
  "Fully trained, multilingual greeters",
  "Available at all major London airports",
  "Flexible support for families, VIPs, elderly, business travelers",
  "Transparent pricing, real-time coordination",
  "Optional buggy and porter add-ons",
  "Festive and late-night service availability"
];

export default function MeetAndGreetPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/meet-and-greet/greeter.png"
            alt="Airport Meet & Greet Service"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center h-full">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-serif text-white leading-tight">
                  Meet and Greet
                  <span className="block text-yellow-400">Airport Assistance</span>
                  <span className="block text-3xl lg:text-4xl font-light text-slate-300">in London</span>
                </h1>
                <p className="text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                  Warm, Professional Support at Every Step of Your Journey
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-600 text-white hover:bg-yellow-700 font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/#estimate">
                    Book Your Service
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
              Navigating busy London airports can be overwhelming — especially after a long flight, with children, or during peak travel seasons. Our Meet and Greet service is designed to remove stress from your journey, offering a warm, professional welcome and seamless airport assistance from a dedicated greeter.
            </p>
            
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">We provide tailored airport assistance services across all major London airports, including:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {airports.map((airport, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm">
                    <airport.icon className="h-6 w-6 text-yellow-600" />
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{airport.name}</h3>
                      <p className="text-sm text-gray-600">{airport.terminals}</p>
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Our Meet and Greet Service Types</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer three flexible options to suit your needs
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

      {/* Who Is This Service For Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">Who Is This Service For?</h2>
              <p className="text-xl text-gray-600 mb-8">
                No matter your reason, our goal is to deliver a stress-free airport experience with a friendly face to guide you.
              </p>
              
              <div className="space-y-4">
                {whoFor.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative h-[500px] w-full">
              <Image
                src="/images/meet-and-greet/fasttrack.jpeg"
                alt="Airport Fast Track Service"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">What's Included?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whatsIncluded.map((item, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-700 font-medium">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Clear, upfront pricing with no hidden costs
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Item</th>
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Price</th>
                  <th className="border border-gray-200 px-6 py-4 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-6 py-4 font-medium">{item.item}</td>
                    <td className="border border-gray-200 px-6 py-4 text-yellow-600 font-semibold">{item.price}</td>
                    <td className="border border-gray-200 px-6 py-4 text-gray-600">{item.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> All prices shown above are exclusive of 20% VAT. Final pricing will include applicable VAT charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Book With Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[500px] w-full">
              <Image
                src="/images/meet-and-greet/bagcar.jpeg"
                alt="Baggage Assistance"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">Why Book With Us?</h2>
              </div>

              <div className="space-y-4">
                {whyBookWithUs.map((reason, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Button 
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 rounded-none text-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/#estimate">
                    Book Your Service
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serving All London Airports Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Serving All London Airports</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our services are available across all major London airports
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {airports.map((airport, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <airport.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{airport.name}</h3>
                  <p className="text-gray-600">{airport.terminals}</p>
                  {airport.name === "Heathrow Airport" && (
                    <p className="text-sm text-yellow-600 font-medium mt-2">Buggy & Inter-terminal services available</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12 p-6 bg-yellow-50 rounded-lg">
            <p className="text-lg text-gray-700">
              <strong>Note:</strong> Only Heathrow offers buggy and inter-terminal connections.
            </p>
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
              Book Your Meet and Greet Today
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you're arriving, departing, or making a connection, our professional greeters will ensure your airport experience is smooth and welcoming.
            </p>
            <p className="text-lg text-yellow-400 font-medium">
              Let us handle the hassle — so you can focus on your journey.
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
                  Get a Quote for bespoke services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 