import { supabaseAdmin } from "@/lib/supabase";
import { Vehicle, Booking, Driver, DriverPayment, DriverStatus, Location, ServicePricing, ExtraCharge } from "@/types/admin";

type FetchResult<T> = {
  data: T[] | null;
  error: string | null;
  isLoading: boolean;
};

export const fetchVehicles = async (): Promise<FetchResult<Vehicle>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("vehicles").select("*").order("base_price", { ascending: true });
    if (error) throw new Error(error.message);
    isLoading = false;
    const normalizedData = data?.map((vehicle) => {
      const normalizedVehicle = {
        id: vehicle.id,
        title: vehicle.title || "",
        name: vehicle.name || "",
        description: vehicle.description || "",
        passengers: vehicle.passengers || 1,
        bags: vehicle.bags || 0,
        wifi: vehicle.wifi ?? false,
        meet_greet: vehicle.meet_greet ?? false,
        drinks: vehicle.drinks ?? false,
        waiting_time: vehicle.waiting_time || "",
        base_price: vehicle.base_price || 0,
        price_per_hour: vehicle.price_per_hour || 0,
        image_url: vehicle.image_url || "",
        created_at: vehicle.created_at,
        vehicle_status:vehicle.vehicle_status,
        daily_rate:vehicle.daily_rate
      };
      return normalizedVehicle;
    }) || [];
    return { data: normalizedData, error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching vehicles:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.vehicles\" does not exist")
      ? "The 'vehicles' table does not exist in the database. Please create it."
      : "Failed to load vehicles. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

export const fetchBookings = async (): Promise<FetchResult<Booking>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    isLoading = false;
    const normalizedData = data?.map((booking) => {
      const validDriverStatus: DriverStatus = ["unassigned", "assigned", "completed"].includes(booking.driver_status)
        ? booking.driver_status as DriverStatus
        : "unassigned";
      return {
        id: booking.id,
        booking_ref: booking.booking_ref || new Date(booking.created_at).toISOString().replace(/[-:T.Z]/g, "").slice(0, 14),
        created_at: booking.created_at,
        full_name: booking.full_name || "",
        email: booking.email || "",
        phone: booking.phone || null,
        pickup_location: booking.pickup_location || "",
        dropoff_location: booking.dropoff_location || null,
        additional_requests: booking.additional_requests || null,
        date_time: booking.date_time || "",
        selected_vehicle: booking.selected_vehicle || "",
        amount: booking.amount || 0,
        status: booking.status || "pending",
        is_hire_by_hour: booking.is_hire_by_hour ?? false,
        duration: booking.duration || null,
        duration_unit: booking.duration_unit || null,
        driver_id: booking.driver_id || null,
        driver_status: validDriverStatus,
        contact_consent:booking.contact_consent,
        is_daily_hire:booking.is_daily_hire ?? false
      };
    }) || [];
    return { data: normalizedData, error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching bookings:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.bookings\" does not exist")
      ? "The 'bookings' table does not exist in the database. Please create it."
      : "Failed to load bookings. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

export const fetchDrivers = async (): Promise<FetchResult<Driver>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("drivers").select("*");
    if (error) throw new Error(error.message);
    isLoading = false;
    return { data: data || [], error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching drivers:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.drivers\" does not exist")
      ? "The 'drivers' table does not exist in the database. Please create it."
      : "Failed to load drivers. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

export const fetchDriverPayments = async (): Promise<FetchResult<DriverPayment>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("driver_payments").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    isLoading = false;
    return { data: data || [], error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching driver payments:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.driver_payments\" does not exist")
      ? "The 'driver_payments' table does not exist in the database. Please create it."
      : "Failed to load driver payments. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

export const fetchLocations = async (): Promise<FetchResult<Location>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("locations").select("*");
    if (error) throw new Error(error.message);
    isLoading = false;
    return { data: data || [], error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching locations:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.locations\" does not exist")
      ? "The 'locations' table does not exist in the database. Please create it."
      : "Failed to load locations. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

export const fetchServicePricing = async (): Promise<FetchResult<ServicePricing>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("service_pricing").select("*");
    if (error) throw new Error(error.message);
    isLoading = false;
    return { data: data || [], error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching service pricing:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.service_pricing\" does not exist")
      ? "The 'service_pricing' table does not exist in the database. Please create it."
      : "Failed to load service pricing. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

export const fetchExtraCharges = async (): Promise<FetchResult<ExtraCharge>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("extra_charges").select("*");
    if (error) throw new Error(error.message);
    isLoading = false;
    return { data: data || [], error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching extra charges:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.extra_charges\" does not exist")
      ? "The 'extra_charges' table does not exist in the database. Please create it."
      : "Failed to load extra charges. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};