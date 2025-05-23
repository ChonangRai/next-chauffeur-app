export type DriverStatus = "unassigned" | "assigned" | "completed";

export type Vehicle = {
  id: string;
  title: string;
  name: string;
  description: string;
  passengers: number;
  bags: number;
  wifi: boolean;
  meet_greet: boolean;
  drinks: boolean;
  waiting_time: string;
  base_price: number;
  price_per_hour: number;
  image_url?: string;
  created_at?: string;
  vehicle_status: string;
  daily_rate: number;
};

export type Booking = {
  id: string;
  booking_ref: string;
  full_name: string;
  email: string;
  phone?: string;
  date_time: string;
  pickup_location: string;
  dropoff_location?: string | null;
  service_type: 'meetAndGreet' | 'airportTransfer' | 'hourlyHire';
  service_subtype?: 'arrival' | 'departure' | 'connection' | null;
  departure_flight?: string;
  arrival_flight?: string;
  passengers: number;
  luggage?: number;
  additional_hours?: number;
  want_buggy?: boolean;
  want_porter?: boolean;
  amount: number;
  payment_status?: string;
  driver_id?: string | null;
  driver_status?: string;
  selected_vehicle?: string;
  status?: string;
  duration?: number;
  duration_unit?: string;
  created_at: string;
  updated_at: string;
};

export type Driver = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  payment_details: string;
  status: string;
};

export type DriverPayment = {
  id: string;
  created_at: string;
  driver_id: string;
  booking_id: string;
  amount: number;
  status: string;
  payment_date: string | null;
  payment_method: string;
};

export interface Location {
  id: number;
  name: string;
  status: "active" | "inactive";
  isAirport: boolean;
  terminals?: string[];
}

export interface ServicePricing {
  id: string;
  baseRate: number;
  description: string;
}


export interface ExtraCharge {
  id: string;
  amount: number;
  description: string;
}

