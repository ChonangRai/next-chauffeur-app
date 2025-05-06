"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VehiclesTab from "@/components/admin/VehiclesTab";
import BookingsTab from "@/components/admin/BookingsTab";
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
import { ChevronLeft, ChevronRight, Car, Calendar, DollarSign, FileText, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "vehicles" | "bookings" | "payments" | "invoices" | "priceSettings"
  >("vehicles");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed

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
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);
  const [driverError, setDriverError] = useState<string | null>(null);

  // State for driver payments
  const [driverPayments, setDriverPayments] = useState<DriverPayment[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Fetch all data when authenticated
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
        fetchDrivers().then(({ data, error, isLoading }) => {
          setDrivers(data || []);
          setDriverError(error);
          setIsLoadingDrivers(isLoading);
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar
          className={cn(
            "absolute top-0 left-0 h-full transition-transform duration-300 border-r border-gray-200 bg-white z-20",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ width: "16rem" }} // Fixed width for consistency
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
            <SidebarTrigger
              onClick={() => setIsSidebarOpen(false)} // Close sidebar
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </Button>
            </SidebarTrigger>
          </div>
          <SidebarContent>
            <SidebarGroup className="mt-4">
              <SidebarMenuItem
                onClick={() => {
                  setActiveTab("vehicles");
                  setIsSidebarOpen(false); // Close sidebar after selection
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "vehicles" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Car className="h-5 w-5" />
                <span>Vehicles</span>
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => {
                  setActiveTab("bookings");
                  setIsSidebarOpen(false); // Close sidebar after selection
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "bookings" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Calendar className="h-5 w-5" />
                <span>Bookings</span>
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => {
                  setActiveTab("payments");
                  setIsSidebarOpen(false); // Close sidebar after selection
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "payments" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <DollarSign className="h-5 w-5" />
                <span>Payments</span>
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => {
                  setActiveTab("invoices");
                  setIsSidebarOpen(false); // Close sidebar after selection
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "invoices" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <FileText className="h-5 w-5" />
                <span>Invoices</span>
              </SidebarMenuItem>
              <SidebarMenuItem
                onClick={() => {
                  setActiveTab("priceSettings");
                  setIsSidebarOpen(false); // Close sidebar after selection
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors",
                  activeTab === "priceSettings" ? "bg-indigo-100 text-indigo-700" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Settings className="h-5 w-5" />
                <span>Price Settings</span>
              </SidebarMenuItem>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content with Sidebar Toggle Button */}
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)} // Open sidebar
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
          <div className="p-6">
            <div className="bg-white p-6 rounded-lg shadow-md w-full">
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

              {activeTab === "bookings" && (
                <BookingsTab
                  bookings={bookings}
                  isLoadingBookings={isLoadingBookings}
                  bookingError={bookingError}
                  drivers={drivers}
                  fetchBookings={async () => {
                    const { data, error, isLoading } = await fetchBookings();
                    setBookings(data || []);
                    setBookingError(error);
                    setIsLoadingBookings(isLoading);
                  }}
                  fetchDriverPayments={async () => {
                    const { data, error, isLoading } = await fetchDriverPayments();
                    setDriverPayments(data || []);
                    setPaymentError(error);
                    setIsLoadingPayments(isLoading);
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
      </div>
    </SidebarProvider>
  );
}