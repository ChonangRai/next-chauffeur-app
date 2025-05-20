"use client";
import {
  Mail,
  Menu,
  Phone,
  X,
  ChevronDown,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            <Link
              href="/services"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Services
            </Link>
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
                              router.push("/user/dashboard");
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </button>
                          <button
                            onClick={() => {
                              router.push("/user/profile");
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
          <Link
            href="/services"
            onClick={toggleMenu}
            className="text-sm font-medium hover:text-primary"
          >
            Services
          </Link>
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
                    href="/user/dashboard"
                    onClick={toggleMenu}
                    className="text-sm font-medium hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/user/profile"
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
