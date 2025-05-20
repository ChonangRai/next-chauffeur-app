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

export interface Booking {
  id: string;
  email: string;
  date_time: string;
  service_type: string;
  pickup_location: string;
  dropoff_location: string | null;
  passengers: number;
  luggage: number;
  flight_number?: string;
  terminal?: string;
  status: string;
  created_at: string;
  updated_at: string;
  amount: number;
  full_name: string;
  phone?: string;
  driver_id?: string | null;
  driver_status?: string;
  selected_vehicle?: string;
  is_hire_by_hour?: boolean;
  duration?: number;
  duration_unit?: string;
  booking_ref: string;
}

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

export type Location = {
  id: number;
  name: string;
  status: "active" | "inactive";
}

export type ServicePricing = {
  id: number;
  service_type: string;
  sub_type: string;
  base_price: number;
}

export type ExtraCharge = {
  id: number;
  charge_type: string;
  amount: number;
}
