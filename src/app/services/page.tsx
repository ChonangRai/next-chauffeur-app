import { Metadata } from 'next';
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plane, 
  Clock, 
  Users, 
  Shield, 
  Star, 
  ArrowRight,
  CheckCircle,
  Zap
} from "lucide-react";

export const metadata: Metadata = {
  title: 'Luxury Chauffeur Services in London | London Chauffeur Hire',
  description: 'Professional luxury chauffeur services in London. Airport transfers, meet & greet, and hourly hire with premium vehicles and experienced drivers. Book your luxury transport today.',
  metadataBase: new URL('https://londonchauffeurhire.com'),
  keywords: [
    'luxury chauffeur service',
    'London chauffeur',
    'airport transfer London',
    'meet and greet service',
    'hire by hour chauffeur',
    'luxury car hire London',
    'professional driver',
    'Heathrow transfer',
    'Gatwick transfer',
    'VIP transport London'
  ],
  authors: [{ name: 'London Chauffeur Hire' }],
  openGraph: {
    title: 'Luxury Chauffeur Services in London | London Chauffeur Hire',
    description: 'Professional luxury chauffeur services in London. Airport transfers, meet & greet, and hourly hire with premium vehicles and experienced drivers.',
    images: ['/images/airport-transfer.jpg'],
    type: 'website',
    locale: 'en_GB',
    siteName: 'London Chauffeur Hire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luxury Chauffeur Services in London | London Chauffeur Hire',
    description: 'Professional luxury chauffeur services in London. Airport transfers, meet & greet, and hourly hire with premium vehicles and experienced drivers.',
    images: ['/images/airport-transfer.jpg'],
  },
  alternates: {
    canonical: 'https://londonchauffeurhire.com/services',
  },
};

const services = [
  {
    id: 'airport-transfer',
    title: 'Airport Transfer',
    subtitle: 'Seamless Airport Transportation',
    description: 'Professional airport transfer service covering all London airports with flight monitoring, meet & greet, and luggage assistance.',
    image: '/images/airport-transfer.jpg',
    icon: Plane,
    features: [
      'Flight monitoring & real-time updates',
      'Meet & greet service with name board',
      'Luggage assistance included',
      'All London airports covered',
      '24/7 availability'
    ],
    benefits: [
      'No waiting in queues',
      'Fixed pricing with no hidden charges',
      'Professional uniformed chauffeurs',
      'Luxury vehicles with modern amenities'
    ],
    link: '/services/airport-transfer',
    cta: 'Book Airport Transfer'
  },
  {
    id: 'meet-and-greet',
    title: 'Meet & Greet',
    subtitle: 'Premium Meet & Greet Service',
    description: 'Luxury meet & greet service with personal assistance, fast track options, and dedicated support for VIP arrivals and departures.',
    image: '/images/meet-and-greet/greeter.png',
    icon: Users,
    features: [
      'Personal greeter with name board',
      'Fast track airport assistance',
      'Baggage collection & handling',
      'VIP lounge access (where available)',
      'Customized welcome packages'
    ],
    benefits: [
      'Skip airport queues',
      'Personalized attention',
      'Stress-free travel experience',
      'Professional assistance throughout'
    ],
    link: '/services/meet-and-greet',
    cta: 'Book Meet & Greet'
  },
  {
    id: 'hire-by-hour',
    title: 'Hire By Hour',
    subtitle: 'Flexible Hourly Chauffeur Service',
    description: 'Flexible hourly chauffeur service perfect for business meetings, city tours, events, or day trips with complete schedule control.',
    image: '/images/corporate-travel.jpg',
    icon: Clock,
    features: [
      'Full control of your schedule',
      'Wait-and-return service',
      'Transparent hourly pricing',
      'Business & personal use',
      'City-wide coverage'
    ],
    benefits: [
      'No parking worries',
      'Professional chauffeur at your disposal',
      'Luxury vehicle comfort',
      'Flexible pickup & drop-off'
    ],
    link: '/services/hire-by-hour',
    cta: 'Book Hourly Service'
  }
];

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Fully Licensed & Insured',
    description: 'All vehicles and drivers are fully licensed and comprehensively insured for your peace of mind.'
  },
  {
    icon: Star,
    title: 'Premium Fleet',
    description: 'Luxury vehicles including Mercedes, BMW, Range Rover, and more, all meticulously maintained.'
  },
  {
    icon: Users,
    title: 'Professional Chauffeurs',
    description: 'Experienced, uniformed chauffeurs with extensive knowledge of London and surrounding areas.'
  },
  {
    icon: Zap,
    title: '24/7 Availability',
    description: 'Round-the-clock service with real-time booking and instant confirmation for urgent travel needs.'
  }
];

const testimonials = [
  {
    name: 'David Thompson',
    role: 'Business Executive',
    content: 'Exceptional service from start to finish. My driver was professional, punctual, and the vehicle was immaculate. Highly recommend for business travel.',
    rating: 5
  },
  {
    name: 'Maria Rodriguez',
    role: 'Family Traveler',
    content: 'Traveling with children was made so much easier with their meet & greet service. The personal attention and assistance was outstanding.',
    rating: 5
  },
  {
    name: 'James Wilson',
    role: 'Frequent Flyer',
    content: 'I use their airport transfer service regularly. Always on time, professional, and the hourly service gives me complete flexibility for meetings.',
    rating: 5
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/airport-transfer.jpg"
            alt="Luxury Chauffeur Services in London"
            fill
            className="object-cover"
            sizes="100vw"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-serif text-white leading-tight">
                  Luxury Chauffeur
                  <span className="block text-yellow-400">Services</span>
                  <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-slate-300">in London</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                  Professional chauffeur services with premium vehicles and experienced drivers for all your transportation needs.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300 hover:scale-105"
                  asChild
                >
                  <Link href="/#estimate">
                    Get a Quote
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className=" hover:bg-yellow-400 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">
                    Contact Us
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Our Premium Services</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We offer three core luxury chauffeur services designed to meet all your transportation requirements 
              with the highest standards of professionalism and comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service) => (
              <Card key={service.id} className="group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg">
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                    <div className="bg-yellow-600 p-2 sm:p-3 rounded-lg">
                      <service.icon className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6 sm:p-8">
                  <div className="space-y-4">
                    <div>
                      <Link href={service.link} className="hover:text-yellow-600 transition-colors">
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">{service.title}</h3>
                      </Link>
                      <p className="text-yellow-600 font-medium text-sm sm:text-base">{service.subtitle}</p>
                    </div>
                    
                    <p className="text-gray-600 text-sm sm:text-base">{service.description}</p>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Key Features:</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Benefits:</h4>
                      <ul className="space-y-2">
                        {service.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4">
                      <Button 
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-semibold text-sm sm:text-base"
                        asChild
                      >
                        <Link href={service.link}>
                          {service.cta}
                          <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Why Choose London Chauffeur Hire?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We combine luxury, reliability, and professionalism to deliver an exceptional chauffeur service experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {whyChooseUs.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="bg-yellow-600 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">What Our Clients Say</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our valued clients have to say about our services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to Experience Luxury?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Book your preferred service today and enjoy the ultimate in luxury transportation 
              with our professional chauffeur service.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link href="/#estimate">
                  Get a Quote
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300"
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
  )
}

