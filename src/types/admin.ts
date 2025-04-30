export type Car = {
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
  price_per_hour:number,
  image_url?: string; 
  created_at?: string;
};

export type Booking = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  pickup_location: string;
  dropoff_location: string | null;
  additional_requests: string | null;
  date_time: string;
  selected_car: string;
  amount: number;
  status: string;
  is_hire_by_hour: boolean;
  duration: number | null;
  duration_unit: string | null;
  driver_id: string | null;
  driver_status: string;
};

export type Driver = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  payment_details: string;
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