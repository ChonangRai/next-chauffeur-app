import { Metadata } from 'next';
import { getBookingById } from "@/lib/firebase-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Briefcase, Phone, Mail, Car, Star, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Progress bar component
function BookingProgressBar({ booking }: { booking: any }) {
  const steps = [
    {
      id: 'payment',
      title: 'Payment Confirmed',
      description: 'Payment processed successfully',
      completed: booking?.payment_status === 'paid',
      current: booking?.payment_status === 'paid' && booking?.status === 'pending'
    },
    {
      id: 'booking',
      title: 'Booking Confirmed',
      description: 'Booking confirmed by our team',
      completed: booking?.status === 'confirmed' || booking?.status === 'completed',
      current: booking?.status === 'confirmed'
    },
    {
      id: 'assigned',
      title: booking?.service_type?.toLowerCase().includes('meet') ? 'Greeter Assigned' : 'Driver Assigned',
      description: booking?.service_type?.toLowerCase().includes('meet') ? 'Greeter assigned to your booking' : 'Driver assigned to your booking',
      completed: booking?.driver_status === 'assigned' || booking?.driver_status === 'completed',
      current: booking?.driver_status === 'assigned'
    },
    {
      id: 'completed',
      title: 'Journey Complete',
      description: 'Your journey has been completed',
      completed: booking?.status === 'completed',
      current: booking?.status === 'completed'
    }
  ];

  const lastCompletedIndex = steps.findIndex(step => !step.completed) - 1;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Booking Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : step.current ? (
                  <div className="h-6 w-6 rounded-full bg-yellow-600 flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-sm font-semibold ${
                    step.completed ? 'text-green-600' : 
                    step.current ? 'text-yellow-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  {step.current && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{step.description}</p>
                
                {/* Progress Line */}
                {index < steps.length - 1 && (
                  <div className="relative">
                    <div className="absolute left-0 top-0 w-0.5 h-8 bg-gray-200"></div>
                    {index <= lastCompletedIndex && (
                      <div className="absolute left-0 top-0 w-0.5 h-8 bg-green-600 transition-all duration-500"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(((lastCompletedIndex + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((lastCompletedIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Generate metadata for the booking page
export async function generateMetadata({ 
  params 
}: { 
  params: { id: string } 
}): Promise<Metadata> {
  try {
    const booking = await getBookingById(params.id) as any;
    
    if (!booking) {
      return {
        title: "Booking Not Found | London Chauffeur Hire",
        description: "The requested booking could not be found.",
      };
    }

    const title = `Booking ${booking.booking_ref || 'Details'} | London Chauffeur Hire`;
    const description = `View details for your ${booking.service_type || 'chauffeur'} booking. Booking reference: ${booking.booking_ref || 'N/A'}`;

    return {
      title,
      description,
      metadataBase: new URL('https://londonchauffeurhire.com'),
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'en_GB',
        siteName: 'London Chauffeur Hire',
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
      alternates: {
        canonical: `https://londonchauffeurhire.com/booking/${params.id}`,
      },
    };
  } catch (error) {
    return {
      title: "Booking Details | London Chauffeur Hire",
      description: "View your booking details and manage your reservations.",
    };
  }
}

export default async function BookingDetailsPage({ params }: { params: { id: string } }) {
  try {
    const booking = await getBookingById(params.id) as any;

    if (!booking) {
      notFound();
    }

    const formatServiceType = (serviceType: string) => {
      switch (serviceType.toLowerCase()) {
        case 'meetandgreet':
          return 'Meet & Greet';
        case 'airporttransfer':
          return 'Airport Transfer';
        case 'hourlyhire':
          return 'Hire by Hour';
        default:
          return serviceType;
      }
    };

    const getStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'confirmed':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'completed':
          return 'bg-blue-100 text-blue-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const getPaymentStatusColor = (status: string) => {
      switch (status.toLowerCase()) {
        case 'paid':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'failed':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Details
            </h1>
            <p className="text-gray-600">
              Reference: <span className="font-mono font-semibold">{booking.booking_ref}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <BookingProgressBar booking={booking} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Booking Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Status:</span>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(booking.payment_status)}>
                      {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Service Type:</span>
                    <span className="text-sm font-semibold">{formatServiceType(booking.service_type)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Journey Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Journey Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date & Time</p>
                      <p className="text-sm font-semibold">
                        {new Date(booking.date_time).toLocaleDateString('en-GB')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.date_time).toLocaleTimeString('en-GB', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Passengers</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.passengers}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                    <p className="text-sm font-semibold">{booking.pickup_location}</p>
                  </div>
                  
                  {booking.dropoff_location && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dropoff Location</p>
                      <p className="text-sm font-semibold">{booking.dropoff_location}</p>
                    </div>
                  )}

                  {booking.bags && booking.bags > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Luggage</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {booking.bags} bags
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Services */}
              {(booking.want_buggy || booking.want_porter || booking.additional_requests) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Additional Services
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {booking.want_buggy && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Buggy Service</Badge>
                      </div>
                    )}
                    {booking.want_porter && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Porter Service</Badge>
                      </div>
                    )}
                    {booking.additional_requests && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Special Requests</p>
                        <p className="text-sm">{booking.additional_requests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer Name</p>
                    <p className="text-sm font-semibold">{booking.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm font-semibold flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {booking.email}
                    </p>
                  </div>
                  {booking.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {booking.phone}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">£{booking.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Total Amount (inc. VAT)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Creation CTA */}
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Create an Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-yellow-700">
                    Create a free account to:
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-2">
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      View all your bookings in one place
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      Get booking updates and notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      Quick rebooking for future trips
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      Access exclusive member benefits
                    </li>
                  </ul>
                  <div className="space-y-2">
                    <Button asChild className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Link href="/user/signup">Create Account</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/user/signin">Sign In</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/">Book Another Trip</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading booking details:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl">Failed to load booking details</p>
          <Button asChild className="mt-4">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }
} 