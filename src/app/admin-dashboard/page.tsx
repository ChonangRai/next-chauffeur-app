"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CarsTab from "@/components/admin/CarsTab";
import BookingsTab from "@/components/admin/BookingsTab";
import DriverPaymentsTab from "@/components/admin/DriverPaymentsTab";
import InvoicesTab from "@/components/admin/InvoicesTab";
import TabNav from "@/components/admin/TabNav";
import { fetchCars, fetchBookings, fetchDrivers, fetchDriverPayments } from "@/lib/adminFetch";
import { Car, Booking, Driver, DriverPayment } from "@/types/admin";

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"cars" | "bookings" | "payments" | "invoices">("cars");

  // State for cars
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [carError, setCarError] = useState<string | null>(null);

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
        fetchCars().then(({ data, error, isLoading }) => {
          setCars(data || []);
          setCarError(error);
          setIsLoadingCars(isLoading);
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
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Access</h2>
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          <Button onClick={() => setPassword(password)} className="w-full">
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
    <div className="min-h-screen bg-muted p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Admin Dashboard</h1>

        {/* Navigation Tabs */}
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Render the active tab */}
        {activeTab === "cars" && (
          <CarsTab
            cars={cars}
            isLoadingCars={isLoadingCars}
            carError={carError}
            fetchCars={async () => {
              const { data, error, isLoading } = await fetchCars();
              setCars(data || []);
              setCarError(error);
              setIsLoadingCars(isLoading);
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
      </div>
    </div>
  );
}