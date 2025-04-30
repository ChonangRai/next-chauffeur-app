import { supabaseAdmin } from "@/lib/supabase";
import { Car, Booking, Driver, DriverPayment } from "@/types/admin";

type FetchResult<T> = {
  data: T[] | null;
  error: string | null;
  isLoading: boolean;
};

export const fetchCars = async (): Promise<FetchResult<Car>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("vehicles").select("*").order("base_price", { ascending: true });
    if (error) throw new Error(error.message);
    isLoading = false;
    // Normalize the data to ensure no undefined values
    const normalizedData = data?.map((car) => ({
      id: car.id,
      title: car.title || "",
      name: car.name || "",
      description: car.description || "",
      passengers: car.passengers || 1,
      bags: car.bags || 0,
      wifi: car.wifi ?? false,
      meet_greet: car.meet_greet ?? false,
      drinks: car.drinks ?? false,
      waiting_time: car.waiting_time || "",
      base_price: car.base_price || 0,
      created_at: car.created_at,
      price_per_hour:car.price_per_hour || 0,
      image_url:car.image_url || ""
    })) || [];
    return { data: normalizedData, error: null, isLoading };
  } catch (err: any) {
    console.error("Error fetching cars:", err);
    isLoading = false;
    const errorMessage = err.message.includes("relation \"public.cars\" does not exist")
      ? "The 'cars' table does not exist in the database. Please create it."
      : "Failed to load cars. Please try again.";
    return { data: null, error: errorMessage, isLoading };
  }
};

// ... (rest of the file remains unchanged)

export const fetchBookings = async (): Promise<FetchResult<Booking>> => {
  let isLoading = true;
  try {
    const { data, error } = await supabaseAdmin.from("bookings").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    isLoading = false;
    return { data: data || [], error: null, isLoading };
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