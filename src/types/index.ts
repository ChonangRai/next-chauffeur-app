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
  features?: string[];
  brand?: string;
  model?: string;
  specifications?: {
    engine?: string;
    power?: string;
    transmission?: string;
    fuel_type?: string;
    seating?: string;
    luggage?: string;
  };
};

export type Booking = {
  id: string;
  user_id: string;
  booking_ref: string;
  service_type: string;
  service_subtype?: string;
  date_time: string;
  pickup_location: string;
  dropoff_location?: string | null;
  amount: number;
  status: string;
  payment_status?: string;
  stripe_session_id?: string | null;
  created_at: string;
  updated_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
  departure_flight?: string | null;
  arrival_flight?: string | null;
  passengers?: number;
  luggage?: number | null;
  additional_requests?: string | null;
  selected_vehicle?: string | null;
  is_hire_by_hour?: boolean | null;
  duration?: number | null;
  duration_unit?: string | null;
  staff_id?: string | null;
  staff_assigned?: boolean;
  terminal?: string | null;
  additional_hours?: number | null;
  want_buggy?: boolean;
  want_porter?: boolean;
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
  id: string;
  name: string;
  type: 'AIRPORT' | 'HOTEL';
  airport?: string;
  terminal?: string;
  address?: string;
  status: 'active' | 'inactive';
  isAirport?: boolean;
  terminals?: string[];
}

export interface ServiceRate {
  id: string;
  type: string;
  baseRate: number;
  description?: string;
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

export interface BookingData {
  serviceType: 'MEET_AND_ASSIST' | 'AIRPORT_TRANSFER' | 'HIRE_BY_HOUR';
  dateTime: Date;
  passengers: number;
  locationId: string;
  additionalServices?: {
    buggy?: boolean;
    porter?: boolean;
    bags?: number;
  };
  flightDetails?: {
    arrival?: string;
    departure?: string;
  };
  estimatedPrice: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface UserData {
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role?: 'USER' | 'ADMIN';
}

export const COLLECTIONS = {
  LOCATIONS: 'locations',
  SERVICE_RATES: 'service_rates',
  VEHICLES: 'vehicles',
  BOOKINGS: 'bookings',
  USERS: 'users',
} as const;

