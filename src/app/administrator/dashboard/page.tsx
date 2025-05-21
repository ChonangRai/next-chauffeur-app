"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, Car, Calendar, DollarSign, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";


export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "vehicles" | "bookings" | "payments" | "invoices" | "priceSettings"
  >("bookings"); // Default to bookings
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open by default

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
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
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
    }
  }, [password]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Admin Access</h2>
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Button onClick={() => setPassword(password)} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Submit
          </Button>
          {password && password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && (
            <p className="text-red-500 text-center mt-2">Access Denied</p>
          )}
        </div>
      </div>
    );
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
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100 w-full">
        {/* Sidebar */}
        <Sidebar
          className={cn(
            "fixed top-0 left-0 h-full transition-all duration-300 border-r bg-gradient-to-t from-[#1C2526] to-[#323838] text-white",
            isSidebarOpen ? "w-64" : "w-16"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            {isSidebarOpen && (
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            )}
            <SidebarTrigger
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-md hover:bg-gray-700"
            >
              <Button variant="ghost" size="icon">
                {isSidebarOpen ? <ChevronLeft className="h-5 w-5 text-white" /> : <ChevronRight className="h-5 w-5 text-white" />}
              </Button>
            </SidebarTrigger>
          </div>
          <SidebarContent>
            <SidebarGroup className="mt-4">
              <SidebarMenuItem
                onClick={() => setActiveTab("bookings")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "bookings" ? "bg-[#007AFF] text-white" : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Calendar className="h-5 w-5" />
                {isSidebarOpen && <span>Bookings</span>}
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => setActiveTab("vehicles")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "vehicles" ? "bg-[#007AFF] text-white" : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Car className="h-5 w-5" />
                {isSidebarOpen && <span>Vehicles</span>}
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => setActiveTab("payments")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "payments" ? "bg-[#007AFF] text-white" : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <DollarSign className="h-5 w-5" />
                {isSidebarOpen && <span>Payments</span>}
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => setActiveTab("invoices")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "invoices" ? "bg-[#007AFF] text-white" : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <FileText className="h-5 w-5" />
                {isSidebarOpen && <span>Invoices</span>}
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => setActiveTab("priceSettings")}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "priceSettings" ? "bg-[#007AFF] text-white" : "text-gray-300 hover:bg-gray-700"
                )}
              >
                <Settings className="h-5 w-5" />
                {isSidebarOpen && <span>Price Settings</span>}
              </SidebarMenuItem>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 transition-all duration-300 w-full bg-gray-100",
            isSidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          <div className="p-6 w-full">
            {activeTab === "bookings" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <h3 className="text-sm font-medium text-gray-500">Hourly Hire Bookings</h3>
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
        </div>
      </div>
    </SidebarProvider>
  );
}