import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Car, Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-white">London</span>
              <span className="text-yellow-400">Chauffeur</span>
              <span className="text-white">Hire</span>
            </Link>
            <p className="mt-4 text-gray-300 leading-relaxed">
              Providing premium chauffeur services across the UK with luxury
              vehicles, professional drivers, and unparalleled customer service.
              Your journey, our expertise.
            </p>
            <div className="mt-6 flex space-x-4">
              <div className="flex items-center text-yellow-400">
                <Star className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">5-Star Service</span>
              </div>
              <div className="flex items-center text-yellow-400">
                <Car className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Luxury Fleet</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-yellow-400">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/cities"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Cities We Serve
                </Link>
              </li>
              <li>
                <Link
                  href="/vehicles"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/booking"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-yellow-400">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  All Services
                </Link>
              </li>
              <li>
                <Link
                  href="/services/airport-transfer"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Airport Transfers
                </Link>
              </li>
              <li>
                <Link
                  href="/services/meet-and-greet"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Meet & Greet
                </Link>
              </li>
              <li>
                <Link
                  href="/services/hire-by-hour"
                  className="text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  Hire by Hour
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-yellow-400">
              Contact Info
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Phone</p>
                  <p className="text-gray-400">+44 (0) 746 767 7766</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Email</p>
                  <p className="text-gray-400">info@londonchauffeurhire.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Address</p>
                  <p className="text-gray-400">London, United Kingdom</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Service Hours</p>
                  <p className="text-gray-400">24/7 Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Cities Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <h3 className="font-bold text-lg mb-6 text-yellow-400 text-center">
            Popular Cities We Serve
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "London",
              "Manchester",
              "Birmingham",
              "Edinburgh",
              "Glasgow",
              "Liverpool",
              "Leeds",
              "Bristol",
              "Newcastle",
              "Cardiff",
              "Belfast",
              "Nottingham",
            ].map((city) => (
              <Link
                key={city}
                href={`/cities#${city.toLowerCase()}`}
                className="text-gray-300 hover:text-yellow-400 transition-colors text-center text-sm"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} London Chauffeur Hire. All
              rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Professional chauffeur services across the United Kingdom
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6">
            <Link
              href="/terms"
              className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-gray-400 hover:text-yellow-400 transition-colors text-sm"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
