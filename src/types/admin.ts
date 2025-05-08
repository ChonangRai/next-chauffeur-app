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
  vehicle_status:string;
  daily_rate:number;
};

export type Booking = {
  id: string;
  booking_ref: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  pickup_location: string;
  dropoff_location: string | null;
  additional_requests: string | null;
  date_time: string;
  selected_vehicle: string;
  amount: number;
  status: string;
  is_hire_by_hour: boolean;
  contact_consent: boolean;
  duration: number | null;
  duration_unit: string | null;
  driver_id: string | null;
  driver_status: DriverStatus;
  stripe_session_id?: string;
  is_daily_hire: string | null;
  service_type:string;
  passengers:number;
};

export type Driver = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  payment_details: string;
  status:string;
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

export type ServicePricing ={
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