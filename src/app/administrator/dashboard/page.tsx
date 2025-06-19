"use client";

import { useState, useEffect } from "react";
import VehiclesTab from "@/components/admin/VehiclesTab";
import DriverPaymentsTab from "@/components/admin/DriverPaymentsTab";
import InvoicesTab from "@/components/admin/InvoicesTab";
import PriceSettingsTab from "@/components/admin/PriceSettingsTab";
import {
  fetchVehicles,
  fetchBookings,
  fetchDrivers,
  fetchDriverPayments,
  fetchLocations,
  fetchServicePricing,
  fetchExtraCharges,
} from "@/lib/adminFetch";
import { Vehicle, Booking, Driver, DriverPayment } from "@/types/admin";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { isAdminUser } from "@/lib/adminUtils";

const TABS = [
  { key: "bookings", label: "Bookings" },
  { key: "vehicles", label: "Vehicles" },
  { key: "payments", label: "Payments" },
  { key: "invoices", label: "Invoices" },
  { key: "priceSettings", label: "Price Settings" },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "vehicles" | "bookings" | "payments" | "invoices" | "priceSettings"
  >("bookings");

  // State for vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // State for bookings
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // State for drivers
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // State for driver payments
  const [driverPayments, setDriverPayments] = useState<DriverPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.replace("/administrator/signin");
        return;
      }
      try {
        const isAdmin = await isAdminUser(user.uid);
        if (!isAdmin) {
          await auth.signOut();
          window.location.replace("/administrator/signin");
          return;
        }
        setIsAuthenticated(true);
        setIsAdmin(true);
        setIsLoading(false);
        // Fetch all data
        Promise.all([
          fetchVehicles().then(({ data, error, isLoading }) => {
            setVehicles(data || []);
            setVehicleError(error);
            setIsLoadingVehicles(isLoading);
          }),
          fetchBookings().then(({ data, error, isLoading }) => {
            setBookings(data || []);
            setBookingError(error);
            setIsLoadingBookings(isLoading);
          }),
          fetchDrivers().then(({ data }) => {
            setDrivers(data || []);
          }),
          fetchDriverPayments().then(({ data, error, isLoading }) => {
            setDriverPayments(data || []);
            setPaymentError(error);
            setIsLoadingPayments(isLoading);
          }),
        ]);
      } catch (error) {
        await auth.signOut();
        window.location.replace("/administrator/signin");
      }
    });
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  // Calculate stats
  const totalBookings = bookings.length;
  const websiteVisitors = 1500; // Placeholder, replace with real data
  const meetAndGreetBookings = bookings.filter((b) => b.service_type === "meetAndGreet").length;
  const airportTransferBookings = bookings.filter((b) => b.service_type === "airportTransfer").length;
  const hourlyHireBookings = bookings.filter((b) => b.service_type === "hourlyHire").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
  const activeDrivers = drivers.filter((d) => d.status === "active").length;

  return (
    <div className="w-full p-6">
      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors duration-200 focus:outline-none ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300"
            }`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "bookings" && (
        <div>
          {/* Dashboard stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Website Visitors</h3>
              <p className="text-2xl font-bold text-gray-900">{websiteVisitors}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Meet & Greet Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">{meetAndGreetBookings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Airport Transfer Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">{airportTransferBookings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Hire By Hour Bookings</h3>
              <p className="text-2xl font-bold text-gray-900">{hourlyHireBookings}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue (£)</h3>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-500">Active Drivers</h3>
              <p className="text-2xl font-bold text-gray-900">{activeDrivers}</p>
            </div>
          </div>
          {/* BookingsTab can go here if you want bookings table below stats */}
        </div>
      )}
      {activeTab === "vehicles" && (
        <VehiclesTab
          vehicles={vehicles}
          isLoadingVehicles={isLoadingVehicles}
          vehicleError={vehicleError}
          fetchVehicles={async () => {
            const { data, error, isLoading } = await fetchVehicles();
            setVehicles(data || []);
            setVehicleError(error);
            setIsLoadingVehicles(isLoading);
          }}
        />
      )}
      {activeTab === "payments" && (
        <DriverPaymentsTab
          driverPayments={driverPayments}
          isLoadingPayments={isLoadingPayments}
          paymentError={paymentError}
          drivers={drivers}
          fetchDriverPayments={async () => {
            const { data, error, isLoading } = await fetchDriverPayments();
            setDriverPayments(data || []);
            setPaymentError(error);
            setIsLoadingPayments(isLoading);
          }}
        />
      )}
      {activeTab === "invoices" && (
        <InvoicesTab
          bookings={bookings}
          isLoadingBookings={isLoadingBookings}
          bookingError={bookingError}
        />
      )}
      {activeTab === "priceSettings" && (
        <PriceSettingsTab
          fetchLocations={fetchLocations}
          fetchServicePricing={fetchServicePricing}
          fetchExtraCharges={fetchExtraCharges}
        />
      )}
    </div>
  );
}