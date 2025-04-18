"use client"
import { Mail, Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";
import { useState } from "react";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="border-b relative">
            {/* Top Bar */}
            <div className="bg-muted py-2">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                            <div className="flex  text-sm">
                                <Phone className="h-4 w-4 mr-2" />
                                <span>+44 (0) 7467677766</span>
                            </div>
                            <div className="flex text-sm">
                                <Mail className="h-4 w-4 mr-2" />
                                <span>info@yourchauffeurbusiness.com</span>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link href="/#estimate" className="text-sm font-medium hover:underline">
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
                        <Link href="/" className="text-2xl font-bold">
                            LuxuryRide
                        </Link>
                    </div>
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                            About
                        </Link>
                        <Link href="/services" className="text-sm font-medium hover:text-primary transition-colors">
                            Services
                        </Link>
                        <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                            Contact
                        </Link>
                        <Button asChild>
                            <Link href="/#estimate">Get a Quote</Link>
                        </Button>
                    </nav>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Toggle Menu" onClick={toggleMenu}>
                            <Menu className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu (Slide-in) */}
            <div className={`fixed top-0 right-0 h-full w-64 bg-white transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"} z-50`}>
                {/* Close Button */}
                <button onClick={toggleMenu} className="absolute top-4 right-4 text-gray-600">
                    <X className="h-6 w-6" />
                </button>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col mt-16 space-y-6 px-6">
                    <Link href="/" onClick={toggleMenu} className="text-sm font-medium hover:text-primary">
                        Home
                    </Link>
                    <Link href="/about" onClick={toggleMenu} className="text-sm font-medium hover:text-primary">
                        About
                    </Link>
                    <Link href="/services" onClick={toggleMenu} className="text-sm font-medium hover:text-primary">
                        Services
                    </Link>
                    <Link href="/contact" onClick={toggleMenu} className="text-sm font-medium hover:text-primary">
                        Contact
                    </Link>
                    <Link href="/#estimate" onClick={toggleMenu} className="text-sm font-medium hover:text-primary">
                        Get a Quote
                    </Link>
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
