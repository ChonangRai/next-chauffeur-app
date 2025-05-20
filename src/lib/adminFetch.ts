import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Vehicle, Booking, Driver, DriverPayment, Location, ServicePricing, ExtraCharge } from "@/types/admin";

type FetchResult<T> = {
  data: T[] | null;
  error: string | null;
  isLoading: boolean;
};

export const fetchVehicles = async (): Promise<FetchResult<Vehicle>> => {
  let isLoading = true;
  try {
    const vehiclesRef = collection(db, "vehicles");
    const q = query(vehiclesRef, orderBy("basePrice", "asc"));
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map(doc => {
      const vehicle = doc.data();
      return {
        id: doc.id,
        title: vehicle.title || "",
        name: vehicle.name || "",
        description: vehicle.description || "",
        passengers: vehicle.passengers || 1,
        bags: vehicle.bags || 0,
        wifi: vehicle.wifi ?? false,
        meet_greet: vehicle.meetGreet ?? false,
        drinks: vehicle.drinks ?? false,
        waiting_time: vehicle.waitingTime || "",
        base_price: vehicle.basePrice || 0,
        price_per_hour: vehicle.pricePerHour || 0,
        image_url: vehicle.imageUrl || "",
        created_at: vehicle.createdAt,
        vehicle_status: vehicle.status,
        daily_rate: vehicle.dailyRate
      };
    });
    
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching vehicles:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load vehicles", isLoading };
  }
};

export const fetchBookings = async (): Promise<FetchResult<Booking>> => {
  let isLoading = true;
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      booking_ref: doc.data().booking_ref,
      created_at: doc.data().created_at,
      full_name: doc.data().full_name,
      email: doc.data().email,
      phone: doc.data().phone,
      pickup_location: doc.data().pickup_location,
      dropoff_location: doc.data().dropoff_location,
      additional_requests: doc.data().additional_requests,
      date_time: doc.data().date_time,
      selected_vehicle: doc.data().selected_vehicle,
      is_hire_by_hour: doc.data().is_hire_by_hour,
      duration: doc.data().duration,
      duration_unit: doc.data().duration_unit,
      service_type: doc.data().service_type,
      passengers: doc.data().passengers,
      luggage: doc.data().luggage || 0,
      status: doc.data().status || "pending",
      updated_at: doc.data().updated_at || doc.data().created_at,
      amount: doc.data().amount || 0,
      driver_id: doc.data().driver_id,
      driver_status: doc.data().driver_status,
      flight_number: doc.data().flight_number,
      terminal: doc.data().terminal
    })) as Booking[];
    
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching bookings:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load bookings", isLoading };
  }
};

export const fetchDrivers = async (): Promise<FetchResult<Driver>> => {
  let isLoading = true;
  try {
    const driversRef = collection(db, "drivers");
    const snapshot = await getDocs(driversRef);
    const data = snapshot.docs.map(doc => {
      const driver = doc.data();
      return {
        id: doc.id,
        full_name: `${driver.firstName || ""} ${driver.lastName || ""}`.trim(),
        email: driver.email || "",
        phone: driver.phone || "",
        payment_details: driver.paymentDetails || "",
        status: driver.status || "inactive",
      };
    });
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching drivers:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load drivers", isLoading };
  }
};

export const fetchDriverPayments = async (): Promise<FetchResult<DriverPayment>> => {
  let isLoading = true;
  try {
    const paymentsRef = collection(db, "driverPayments");
    const q = query(paymentsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => {
      const payment = doc.data();
      return {
        id: doc.id,
        created_at: payment.createdAt,
        driver_id: payment.driverId,
        booking_id: payment.bookingId,
        amount: payment.amount || 0,
        status: payment.status || "pending",
        payment_date: payment.paymentDate || null,
        payment_method: payment.paymentMethod || "bank_transfer",
      };
    });
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching driver payments:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load driver payments", isLoading };
  }
};

export const fetchLocations = async (): Promise<FetchResult<Location>> => {
  let isLoading = true;
  try {
    const locationsRef = collection(db, "locations");
    const snapshot = await getDocs(locationsRef);
    const data = snapshot.docs.map((doc, index) => ({
      id: index + 1,
      name: doc.data().name || "",
      status: doc.data().status || "active",
    }));
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching locations:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load locations", isLoading };
  }
};

export const fetchServicePricing = async (): Promise<FetchResult<ServicePricing>> => {
  let isLoading = true;
  try {
    const pricingRef = collection(db, "servicePricing");
    const snapshot = await getDocs(pricingRef);
    const data = snapshot.docs.map((doc, index) => ({
      id: index + 1,
      service_type: doc.data().serviceType || "",
      sub_type: doc.data().subType || "",
      base_price: doc.data().basePrice || 0,
    }));
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching service pricing:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load service pricing", isLoading };
  }
};

export const fetchExtraCharges = async (): Promise<FetchResult<ExtraCharge>> => {
  let isLoading = true;
  try {
    const chargesRef = collection(db, "extraCharges");
    const snapshot = await getDocs(chargesRef);
    const data = snapshot.docs.map((doc, index) => ({
      id: index + 1,
      charge_type: doc.data().chargeType || "",
      amount: doc.data().amount || 0,
    }));
    isLoading = false;
    return { data, error: null, isLoading };
  } catch (err: unknown) {
    console.error("Error fetching extra charges:", err);
    isLoading = false;
    return { data: null, error: err instanceof Error ? err.message : "Failed to load extra charges", isLoading };
  }
};