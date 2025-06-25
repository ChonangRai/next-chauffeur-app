"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car, Clock, Star, ArrowRight, Phone, Mail, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";

const ukCities = [
  {
    name: "London",
    region: "Greater London",
    description: "The capital city with world-class attractions, business districts, and luxury hotels.",
    services: ["Airport Transfers", "Business Travel", "Luxury Events", "City Tours"],
    airports: ["Heathrow", "Gatwick", "Stansted", "Luton", "City"],
    image: "/images/airport-transfer.jpg",
    popularRoutes: ["Central London", "Canary Wharf", "West End", "Greenwich"]
  },
  {
    name: "Manchester",
    region: "North West England",
    description: "A vibrant city known for its music scene, football culture, and thriving business community.",
    services: ["Airport Transfers", "Business Travel", "Event Transportation", "City Tours"],
    airports: ["Manchester Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "MediaCityUK", "Old Trafford", "Trafford Centre"]
  },
  {
    name: "Birmingham",
    region: "West Midlands",
    description: "The UK's second-largest city with a rich industrial heritage and modern business hub.",
    services: ["Airport Transfers", "Business Travel", "Shopping Trips", "Cultural Tours"],
    airports: ["Birmingham Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Jewellery Quarter", "Bullring", "NEC"]
  },
  {
    name: "Edinburgh",
    region: "Scotland",
    description: "Scotland's historic capital with stunning architecture, festivals, and cultural heritage.",
    services: ["Airport Transfers", "Business Travel", "Festival Transport", "Historic Tours"],
    airports: ["Edinburgh Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["Old Town", "New Town", "Royal Mile", "Princes Street"]
  },
  {
    name: "Glasgow",
    region: "Scotland",
    description: "Scotland's largest city with vibrant culture, shopping, and business opportunities.",
    services: ["Airport Transfers", "Business Travel", "Shopping Trips", "Cultural Tours"],
    airports: ["Glasgow Airport", "Glasgow Prestwick"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "West End", "Merchant City", "Clyde Waterfront"]
  },
  {
    name: "Liverpool",
    region: "North West England",
    description: "A historic port city famous for music, football, and maritime heritage.",
    services: ["Airport Transfers", "Business Travel", "Football Match Transport", "Cultural Tours"],
    airports: ["Liverpool John Lennon Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Albert Dock", "Anfield", "Goodison Park"]
  },
  {
    name: "Leeds",
    region: "Yorkshire",
    description: "A dynamic city with excellent shopping, dining, and business facilities.",
    services: ["Airport Transfers", "Business Travel", "Shopping Trips", "Event Transportation"],
    airports: ["Leeds Bradford Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Trinity Leeds", "Headingley", "Roundhay Park"]
  },
  {
    name: "Bristol",
    region: "South West England",
    description: "A creative city with maritime history, vibrant culture, and innovative businesses.",
    services: ["Airport Transfers", "Business Travel", "Cultural Tours", "Event Transportation"],
    airports: ["Bristol Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Harbourside", "Clifton", "Temple Quarter"]
  },
  {
    name: "Newcastle",
    region: "North East England",
    description: "A friendly city with rich history, excellent nightlife, and strong business community.",
    services: ["Airport Transfers", "Business Travel", "Nightlife Transport", "Cultural Tours"],
    airports: ["Newcastle Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Quayside", "Jesmond", "Gateshead"]
  },
  {
    name: "Cardiff",
    region: "Wales",
    description: "Wales' capital city with historic castles, modern developments, and cultural attractions.",
    services: ["Airport Transfers", "Business Travel", "Cultural Tours", "Event Transportation"],
    airports: ["Cardiff Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Cardiff Bay", "Cathays Park", "Bute Park"]
  },
  {
    name: "Belfast",
    region: "Northern Ireland",
    description: "Northern Ireland's capital with rich history, vibrant culture, and business opportunities.",
    services: ["Airport Transfers", "Business Travel", "Cultural Tours", "Event Transportation"],
    airports: ["Belfast International Airport", "George Best Belfast City Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Titanic Quarter", "Queen's Quarter", "Cathedral Quarter"]
  },
  {
    name: "Nottingham",
    region: "East Midlands",
    description: "A historic city with legendary connections, modern shopping, and excellent transport links.",
    services: ["Airport Transfers", "Business Travel", "Shopping Trips", "Cultural Tours"],
    airports: ["East Midlands Airport"],
    image: "/images/corporate-travel.jpg",
    popularRoutes: ["City Centre", "Lace Market", "Nottingham Castle", "Wollaton Hall"]
  }
];

const serviceTypes = [
  {
    title: "Airport Transfers",
    description: "Reliable transfers to and from all major UK airports",
    icon: MapPin
  },
  {
    title: "Business Travel",
    description: "Professional transportation for corporate clients",
    icon: Car
  },
  {
    title: "Event Transportation",
    description: "Luxury transport for special occasions and events",
    icon: Star
  },
  {
    title: "Inter-City Travel",
    description: "Comfortable journeys between UK cities",
    icon: Clock
  }
];

export default function CitiesPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [highlightedCity, setHighlightedCity] = useState<string | null>(null);

  useEffect(() => {
    // Set page title and meta description
    document.title = "UK Cities We Serve | London Chauffeur Hire - Nationwide Coverage";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Professional chauffeur services across major UK cities including London, Manchester, Birmingham, Edinburgh, and more. Luxury transportation with experienced drivers.');
    }

    // Handle URL hash for direct city navigation
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove the #
      if (hash) {
        setHighlightedCity(hash);
        // Remove highlight after 3 seconds
        setTimeout(() => setHighlightedCity(null), 3000);
      }
    };

    // Check for hash on initial load
    handleHashChange();

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/airport-transfer.jpg"
            alt="UK Cities Chauffeur Service Coverage"
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
                  UK Cities
                  <span className="block text-yellow-400">We Serve</span>
                  <span className="block text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-slate-300">Nationwide Coverage</span>
                </h1>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 font-light max-w-2xl">
                  Professional chauffeur services across major UK cities with luxury vehicles and experienced drivers.
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
                  className="text-black hover:bg-yellow-600 hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300"
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Our Services Across the UK</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive chauffeur services to meet all your transportation needs, 
              from airport transfers to business travel and special events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {serviceTypes.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 sm:p-8">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">{service.title}</h3>
                  <p className="text-gray-600 text-sm sm:text-base">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Cities We Serve</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From the bustling streets of London to the historic charm of Edinburgh, 
              we provide luxury chauffeur services across the United Kingdom.
            </p>
          </div>

          {/* Quick City Navigation */}
          <div className="mb-8 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-800">Jump to City</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {ukCities.map((city) => (
                <Link
                  key={city.name}
                  href={`#${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-center py-2 px-3 bg-white hover:bg-yellow-50 border border-gray-200 hover:border-yellow-400 rounded text-sm font-medium text-gray-700 hover:text-yellow-700 transition-all duration-200"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {ukCities.map((city, index) => {
              const cityId = city.name.toLowerCase().replace(/\s+/g, '-');
              const isHighlighted = highlightedCity === cityId;
              
              return (
                <Card 
                  key={index} 
                  id={cityId} 
                  className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                    isHighlighted ? 'ring-4 ring-yellow-400 shadow-2xl scale-105' : ''
                  }`}
                >
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <Image
                      src={city.image}
                      alt={`Chauffeur service in ${city.name}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">{city.name}</h3>
                      <p className="text-sm sm:text-base text-slate-300">{city.region}</p>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 sm:p-8">
                    <p className="text-gray-600 text-sm sm:text-base mb-4">{city.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Services Available:</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.services.map((service, serviceIndex) => (
                          <Badge key={serviceIndex} variant="secondary" className="text-xs sm:text-sm">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Airports Served:</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.airports.map((airport, airportIndex) => (
                          <Badge key={airportIndex} className="bg-yellow-100 text-yellow-800 text-xs sm:text-sm">
                            {airport}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Popular Routes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {city.popularRoutes.map((route, routeIndex) => (
                          <Badge key={routeIndex} variant="outline" className="text-xs sm:text-sm">
                            {route}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full mt-6 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold text-sm sm:text-base"
                      asChild
                    >
                      <Link href={`/contact?city=${city.name.toLowerCase()}`}>
                        Book Service in {city.name}
                        <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">Why Choose Our UK-Wide Service?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the same high standards of luxury and professionalism across all UK cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Luxury Fleet</h3>
              <p className="text-gray-600">
                Premium vehicles maintained to the highest standards, available across all locations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Professional Drivers</h3>
              <p className="text-gray-600">
                Experienced, licensed chauffeurs with extensive knowledge of local areas.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Availability</h3>
              <p className="text-gray-600">
                Round-the-clock service with real-time tracking and flexible scheduling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to Experience Luxury Across the UK?
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you're traveling to London, Manchester, Edinburgh, or any other UK city, 
              we provide the same exceptional service and luxury experience.
            </p>
            <p className="text-lg text-yellow-400 font-medium">
              Professional chauffeurs • Luxury vehicles • Nationwide coverage
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
                className=" hover:bg-yellow-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-none text-base sm:text-lg transition-all duration-300"
                asChild
              >
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>Call us: +44 (0) 746 767 7766</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>Email: info@londonchauffeurhire.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-4 right-4 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-4 py-2 rounded-full"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 