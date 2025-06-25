"use client";
import {  Mail, Menu, Phone, X, ChevronDown, LayoutDashboard, User, LogOut, Car} from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { useState, useEffect, useRef, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import clsx from "clsx";
import { fetchVehicles } from "@/lib/adminFetch";
import { Vehicle } from "@/types";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileCarsOpen, setMobileCarsOpen] = useState(false);
  const [mobileMercedesOpen, setMobileMercedesOpen] = useState(false);
  const [mobileRangeRoverOpen, setMobileRangeRoverOpen] = useState(false);
  const [mobileOtherOpen, setMobileOtherOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [carsOpen, setCarsOpen] = useState(false);
  const [mercedesOpen, setMercedesOpen] = useState(false);
  const [rangeRoverOpen, setRangeRoverOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const servicesButtonRef = useRef<HTMLAnchorElement>(null);
  const carsButtonRef = useRef<HTMLButtonElement>(null);
  const mercedesButtonRef = useRef<HTMLButtonElement>(null);
  const rangeRoverButtonRef = useRef<HTMLButtonElement>(null);
  const otherButtonRef = useRef<HTMLButtonElement>(null);
  let servicesMenuCloseTimer: NodeJS.Timeout;
  let carsMenuCloseTimer: NodeJS.Timeout;
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/administrator");

  // Fetch vehicles for dynamic menu
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const result = await fetchVehicles();
        
        if (result.data && result.data.length > 0) {
          // Filter vehicles for the menu (show all except 'draft')
          const availableVehicles = result.data.filter(
            (v) => v.vehicle_status !== "draft"
          );
          
          setVehicles(availableVehicles);
        }
      } catch (err) {
        console.error("Header - Failed to load vehicles for menu:", err);
      } finally {
        setVehiclesLoading(false);
      }
    };

    loadVehicles();
  }, []);

  // Memoize the grouped and filtered vehicles to prevent re-calculation on every render
  const filteredVehiclesByBrand = useMemo(() => {
    const vehiclesByBrand = vehicles.reduce((acc, vehicle) => {
      let brand = vehicle.brand || 'other';
      
      // Special handling for 13-Seater vehicles
      if (vehicle.title.toLowerCase().includes('13-seater') || 
          vehicle.title.toLowerCase().includes('13 seater')) {
        brand = '13-seater';
      }
      
      if (!acc[brand]) {
        acc[brand] = [];
      }
      acc[brand].push(vehicle);
      return acc;
    }, {} as Record<string, Vehicle[]>);

    // Filter out empty brands and sort by name
    return Object.entries(vehiclesByBrand)
      .filter(([brandVehicles]) => brandVehicles.length > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .reduce((acc, [brand, brandVehicles]) => {
        acc[brand] = brandVehicles;
        return acc;
      }, {} as Record<string, Vehicle[]>);
  }, [vehicles]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "profiles", user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/user/signin");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="border-b relative z-[100]">
      {/* Top Bar */}
      <div className="bg-muted py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              <div className="flex text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <span>+44 (0) 7467677766</span>
              </div>
              <div className="flex text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@yourchauffeurbusiness.com</span>
              </div>
            </div>
            <div className="hidden md:block">
              <Link
                href="/#estimate"
                className="text-sm font-medium hover:underline"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/favicon.ico"
                alt="Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-2xl font-bold">
                <span className="text-[#1D3557]">London</span>
                <span className="text-[#DAA520]">Chauffeur</span>
                <span className="text-[#1D3557]">Hire</span>
              </span>
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              About
            </Link>
            <div
              className="relative group"
              onMouseEnter={() => { clearTimeout(servicesMenuCloseTimer); setServicesOpen(true); }}
              onMouseLeave={() => {
                servicesMenuCloseTimer = setTimeout(() => { setServicesOpen(false); }, 120);
              }}
            >
              <Link
                href="/services"
                ref={servicesButtonRef}
                className={clsx(
                  "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 focus:outline-none",
                  servicesOpen && "text-primary"
                )}
                aria-haspopup="menu"
                aria-expanded={servicesOpen}
                aria-controls="services-menu"
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") { setServicesOpen(v => !v); }
                  if (e.key === "Escape") { setServicesOpen(false); servicesButtonRef.current?.focus(); }
                }}
                tabIndex={0}
              >
                Services <ChevronDown className={clsx("h-4 w-4 transition-transform duration-200", servicesOpen && "rotate-180")}/>
              </Link>
              <div
                id="services-menu"
                role="menu"
                aria-label="Services"
                className={clsx(
                  "absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-200 shadow-lg z-50 transition-all duration-300 origin-top opacity-0 scale-95 pointer-events-none",
                  servicesOpen && "opacity-100 scale-100 pointer-events-auto"
                )}
                style={{ transitionProperty: 'opacity, transform' }}
                onMouseEnter={() => { clearTimeout(servicesMenuCloseTimer); setServicesOpen(true); }}
                onMouseLeave={() => {
                  servicesMenuCloseTimer = setTimeout(() => { setServicesOpen(false); }, 120);
                }}
              >
                {/* Optional Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden">
                  <div className="w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 shadow-lg"></div>
                </div>
                <div className="py-2">
                  {/* Dialog Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 text-center">Our Services</h3>
                  </div>
                  <Link
                    href="/services"
                    role="menuitem"
                    tabIndex={servicesOpen ? 0 : -1}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors font-medium border-b border-gray-100"
                    onClick={() => { setServicesOpen(false); }}
                  >
                    View All Services
                  </Link>
                  <Link
                    href="/services/meet-and-greet"
                    role="menuitem"
                    tabIndex={servicesOpen ? 0 : -1}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                    onClick={() => { setServicesOpen(false); }}
                  >
                    Meet & Greet
                  </Link>
                  <Link
                    href="/services/airport-transfer"
                    role="menuitem"
                    tabIndex={servicesOpen ? 0 : -1}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                    onClick={() => { setServicesOpen(false); }}
                  >
                    Airport Transfer
                  </Link>
                  <Link
                    href="/services/hire-by-hour"
                    role="menuitem"
                    tabIndex={servicesOpen ? 0 : -1}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors"
                    onClick={() => { setServicesOpen(false); }}
                  >
                    Hire By Hour
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="relative group"
              onMouseEnter={() => { clearTimeout(carsMenuCloseTimer); setCarsOpen(true); }}
              onMouseLeave={() => {
                carsMenuCloseTimer = setTimeout(() => { setCarsOpen(false); }, 120);
              }}
            >
              <button
                ref={carsButtonRef}
                className={clsx(
                  "text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 focus:outline-none",
                  carsOpen && "text-primary"
                )}
                aria-haspopup="menu"
                aria-expanded={carsOpen}
                aria-controls="cars-menu"
                onClick={e => { e.preventDefault(); setCarsOpen(v => !v); }}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") { setCarsOpen(v => !v); }
                  if (e.key === "Escape") { setCarsOpen(false); carsButtonRef.current?.focus(); }
                }}
                tabIndex={0}
              >
                <Car className="h-4 w-4" />
                Cars <ChevronDown className={clsx("h-4 w-4 transition-transform duration-200", carsOpen && "rotate-180")}/>
              </button>
              <div
                id="cars-menu"
                role="menu"
                aria-label="Cars"
                className={clsx(
                  "absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-gray-200 shadow-lg z-50 transition-all duration-300 origin-top opacity-0 scale-95 pointer-events-none",
                  carsOpen && "opacity-100 scale-100 pointer-events-auto"
                )}
                style={{ transitionProperty: 'opacity, transform' }}
                onMouseEnter={() => { clearTimeout(carsMenuCloseTimer); setCarsOpen(true); }}
                onMouseLeave={() => {
                  carsMenuCloseTimer = setTimeout(() => { setCarsOpen(false); }, 120);
                }}
              >
                {/* Optional Arrow */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 overflow-hidden">
                  <div className="w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 shadow-lg"></div>
                </div>
                <div className="py-2">
                  {/* Dialog Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-900 text-center">Our Fleet</h3>
                  </div>
                  
                  {/* View All Vehicles */}
                  <Link
                    href="/vehicles"
                    role="menuitem"
                    tabIndex={carsOpen ? 0 : -1}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors font-medium border-b border-gray-100"
                    onClick={() => { setCarsOpen(false); }}
                  >
                    View All Vehicles
                  </Link>
                  
                  {/* Dynamic Vehicle Brands */}
                  {vehiclesLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      Loading vehicles...
                    </div>
                  ) : Object.keys(filteredVehiclesByBrand).length > 0 ? (
                    Object.entries(filteredVehiclesByBrand).map(([brand, brandVehicles]) => {
                      const brandKey = brand.toLowerCase().replace(/\s+/g, '-');
                      const isOpen = brandKey === 'mercedes' ? mercedesOpen : 
                                   brandKey === 'range-rover' ? rangeRoverOpen : 
                                   brandKey === '13-seater' ? otherOpen : 
                                   brandKey === 'other' ? otherOpen : false;
                      const setIsOpen = brandKey === 'mercedes' ? setMercedesOpen : 
                                      brandKey === 'range-rover' ? setRangeRoverOpen : 
                                      brandKey === '13-seater' ? setOtherOpen : 
                                      brandKey === 'other' ? setOtherOpen : () => {};
                      const buttonRef = brandKey === 'mercedes' ? mercedesButtonRef : 
                                      brandKey === 'range-rover' ? rangeRoverButtonRef : 
                                      brandKey === '13-seater' ? otherButtonRef : 
                                      brandKey === 'other' ? otherButtonRef : null;
                      
                      return (
                        <div key={brand} className="relative">
                          <button
                            ref={buttonRef}
                            className={clsx(
                              "flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors focus:outline-none border-b border-gray-100",
                              isOpen && "bg-gray-50"
                            )}
                            aria-haspopup="menu"
                            aria-expanded={isOpen}
                            aria-controls={`${brandKey}-menu`}
                            tabIndex={carsOpen ? 0 : -1}
                            onClick={e => { e.preventDefault(); setIsOpen(v => !v); }}
                            onKeyDown={e => {
                              if (e.key === "Enter" || e.key === " ") { setIsOpen(v => !v); }
                              if (e.key === "Escape") { setIsOpen(false); buttonRef?.current?.focus(); }
                            }}
                          >
                            <span className="font-medium capitalize">{brand}</span>
                            <ChevronDown className={clsx("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")}/>
                          </button>
                          <div
                            id={`${brandKey}-menu`}
                            role="menu"
                            aria-label={brand}
                            className={clsx(
                              "overflow-hidden transition-all duration-300 ease-in-out",
                              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <div className="bg-gray-50">
                              {brandVehicles.map((vehicle: Vehicle) => {
                                // Generate URL based on vehicle data
                                let vehicleUrl = `/vehicles/${vehicle.brand || 'default'}/${vehicle.model || 'default'}`;
                                
                                // Special handling for vehicles that might not have proper brand/model
                                // Check if this is a vehicle that should use a different URL structure
                                if (vehicle.title.toLowerCase().includes('13-seater') || 
                                    vehicle.title.toLowerCase().includes('13 seater')) {
                                  vehicleUrl = `/cars/13-seater/default`;
                                }
                                
                                return (
                                  <Link
                                    key={vehicle.id}
                                    href={vehicleUrl}
                                    role="menuitem"
                                    tabIndex={isOpen ? 0 : -1}
                                    className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                    onClick={() => { setIsOpen(false); setCarsOpen(false); }}
                                  >
                                    {vehicle.name}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No vehicles available
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/contact"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </Link>
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 hover:bg-accent"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>Hello, {userProfile?.firstName || "User"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              router.push(isAdminRoute ? "/administrator/dashboard" : "/user/dashboard");
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push(isAdminRoute ? "/administrator/profile" : "/user/profile");
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                          </button>
                          <div className="border-t border-gray-100"></div>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button asChild>
                    <Link href="/user/signin">Sign in</Link>
                  </Button>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Toggle Menu"
              onClick={toggleMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Slide-in) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } z-50`}
      >
        {/* Close Button */}
        <button
          onClick={toggleMenu}
          className="absolute top-4 right-4 text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Mobile Nav Links */}
        <nav className="flex flex-col mt-16 space-y-6 px-6">
          <Link
            href="/"
            onClick={toggleMenu}
            className="text-sm font-medium hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={toggleMenu}
            className="text-sm font-medium hover:text-primary"
          >
            About
          </Link>
          <button
            className="flex items-center justify-between text-sm font-medium hover:text-primary focus:outline-none w-full bg-transparent border-0 p-0"
            onClick={() => setMobileServicesOpen((v) => !v)}
            aria-expanded={mobileServicesOpen}
            aria-controls="mobile-services-menu"
            type="button"
          >
            <span>Services</span>
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileServicesOpen && (
            <div id="mobile-services-menu" className="ml-4 flex flex-col space-y-2">
              <Link
                href="/services"
                onClick={() => { toggleMenu(); setMobileServicesOpen(false); }}
                className="text-sm font-medium hover:text-primary"
              >
                View All Services
              </Link>
              <Link
                href="/services/meet-and-greet"
                onClick={() => { toggleMenu(); setMobileServicesOpen(false); }}
                className="text-sm font-medium hover:text-primary"
              >
                Meet & Greet
              </Link>
              <Link
                href="/services/airport-transfer"
                onClick={() => { toggleMenu(); setMobileServicesOpen(false); }}
                className="text-sm font-medium hover:text-primary"
              >
                Airport Transfer
              </Link>
              <Link
                href="/services/hire-by-hour"
                onClick={() => { toggleMenu(); setMobileServicesOpen(false); }}
                className="text-sm font-medium hover:text-primary"
              >
                Hire By Hour
              </Link>
            </div>
          )}

          {/* Mobile Cars Menu */}
          <button
            className="flex items-center justify-between text-sm font-medium hover:text-primary focus:outline-none w-full bg-transparent border-0 p-0"
            onClick={() => setMobileCarsOpen((v) => !v)}
            aria-expanded={mobileCarsOpen}
            aria-controls="mobile-cars-menu"
            type="button"
          >
            <span className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Cars
            </span>
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${mobileCarsOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileCarsOpen && (
            <div id="mobile-cars-menu" className="ml-4 flex flex-col space-y-2">
              {/* View All Vehicles */}
              <Link
                href="/vehicles"
                onClick={() => { toggleMenu(); setMobileCarsOpen(false); }}
                className="text-sm font-medium hover:text-primary"
              >
                View All Vehicles
              </Link>
              
              {/* Dynamic Mobile Vehicle Brands */}
              {vehiclesLoading ? (
                <div className="text-sm text-gray-500">
                  Loading vehicles...
                </div>
              ) : Object.keys(filteredVehiclesByBrand).length > 0 ? (
                Object.entries(filteredVehiclesByBrand).map(([brand, brandVehicles]) => {
                  const brandKey = brand.toLowerCase().replace(/\s+/g, '-');
                  const isOpen = brandKey === 'mercedes' ? mobileMercedesOpen : 
                               brandKey === 'range-rover' ? mobileRangeRoverOpen : 
                               brandKey === '13-seater' ? mobileOtherOpen : 
                               brandKey === 'other' ? mobileOtherOpen : false;
                  const setIsOpen = brandKey === 'mercedes' ? setMobileMercedesOpen : 
                                  brandKey === 'range-rover' ? setMobileRangeRoverOpen : 
                                  brandKey === '13-seater' ? setMobileOtherOpen : 
                                  brandKey === 'other' ? setMobileOtherOpen : () => {};
                  
                  return (
                    <div key={brand}>
                      <button
                        className="flex items-center justify-between text-sm font-medium hover:text-primary focus:outline-none w-full bg-transparent border-0 p-0"
                        onClick={() => setIsOpen((v) => !v)}
                        aria-expanded={isOpen}
                        aria-controls={`mobile-${brandKey}-menu`}
                        type="button"
                      >
                        <span className="capitalize">{brand}</span>
                        <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div id={`mobile-${brandKey}-menu`} className="ml-4 flex flex-col space-y-2">
                          {brandVehicles.map((vehicle: Vehicle) => {
                            // Generate URL based on vehicle data
                            let vehicleUrl = `/vehicles/${vehicle.brand || 'default'}/${vehicle.model || 'default'}`;
                            
                            // Special handling for vehicles that might not have proper brand/model
                            // Check if this is a vehicle that should use a different URL structure
                            if (vehicle.title.toLowerCase().includes('13-seater') || 
                                vehicle.title.toLowerCase().includes('13 seater')) {
                              vehicleUrl = `/cars/13-seater/default`;
                            }
                            
                            return (
                              <Link
                                key={vehicle.id}
                                href={vehicleUrl}
                                onClick={() => { toggleMenu(); setMobileCarsOpen(false); setIsOpen(false); }}
                                className="text-sm font-medium hover:text-primary"
                              >
                                {vehicle.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">
                  No vehicles available
                </div>
              )}
            </div>
          )}

          <Link
            href="/contact"
            onClick={toggleMenu}
            className="text-sm font-medium hover:text-primary"
          >
            Contact
          </Link>
          {!isLoading && (
            <>
              {user ? (
                <>
                  <div className="text-sm font-medium">
                    Hello, {userProfile?.firstName || "User"}
                  </div>
                  <Link
                    href={isAdminRoute ? "/administrator/dashboard" : "/user/dashboard"}
                    onClick={toggleMenu}
                    className="text-sm font-medium hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href={isAdminRoute ? "/administrator/profile" : "/user/profile"}
                    onClick={toggleMenu}
                    className="text-sm font-medium hover:text-primary"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="text-sm font-medium hover:text-primary text-left text-red-600"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link
                  href="/user/signin"
                  onClick={toggleMenu}
                  className="text-sm font-medium hover:text-primary"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </nav>
      </div>

      {/* Overlay (click outside to close menu) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleMenu}
        ></div>
      )}
    </header>
  );
}
