import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

// Helper function to get service-specific "What's Next?" content
const getWhatsNextContent = (serviceType: string) => {
  switch (serviceType.toLowerCase()) {
    case 'meetandgreet':
      return {
        title: "What's Next?",
        items: [
          "Your payment is processed and booking is submitted",
          "You will receive a booking confirmation email once our team confirms your greeter",
          "Your greeter will contact you 24 hours before your journey",
          "Create an account to view all your bookings in one place",
          "Keep this email for your records"
        ]
      };
    case 'airporttransfer':
      return {
        title: "What's Next?",
        items: [
          "Your payment is processed and booking is submitted",
          "You will receive a booking confirmation email once our team confirms your driver",
          "Your driver will contact you 24 hours before your journey",
          "Create an account to view all your bookings in one place",
          "Keep this email for your records"
        ]
      };
    case 'hourlyhire':
      return {
        title: "What's Next?",
        items: [
          "Your payment is processed and booking is submitted",
          "You will receive a booking confirmation email once our team confirms your driver",
          "Your driver will contact you 24 hours before your journey",
          "Create an account to view all your bookings in one place",
          "Keep this email for your records"
        ]
      };
    default:
      return {
        title: "What's Next?",
        items: [
          "Your payment is processed and booking is submitted",
          "You will receive a booking confirmation email once our team confirms your booking",
          "Our team will contact you 24 hours before your journey",
          "Create an account to view all your bookings in one place",
          "Keep this email for your records"
        ]
      };
  }
};

// Email templates
const emailTemplates = {
  bookingConfirmation: (bookingData: any) => ({
    subject: `Booking Confirmation - ${bookingData.booking_ref}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">London Chauffeur Hire</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Booking Confirmation</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Booking Confirmed!</h2>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #856404; font-weight: bold;">Booking Reference: ${bookingData.booking_ref}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Service Type:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.service_type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Date & Time:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date(bookingData.date_time).toLocaleString('en-GB')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Pickup Location:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.pickup_location}</td>
              </tr>
              ${bookingData.dropoff_location ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Dropoff Location:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.dropoff_location}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Passengers:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${bookingData.passengers}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Amount:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #ffc107;">£${bookingData.amount}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Important Information</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Please arrive 10 minutes before your scheduled pickup time</li>
              <li>Your ${bookingData.service_type?.toLowerCase().includes('meet') ? 'greeter' : 'driver'} will contact you 30 minutes before pickup</li>
              <li>Have your booking reference ready: <strong>${bookingData.booking_ref}</strong></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://next-chauffeur-app.vercel.app/booking/${bookingData.id}" style="background-color: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking Details</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          <p>Thank you for choosing London Chauffeur Hire</p>
          <p>For any questions, please contact us at support@londonchauffeurhire.com</p>
        </div>
      </div>
    `
  }),
  
  paymentConfirmation: (bookingData: any) => {
    const whatsNext = getWhatsNextContent(bookingData.service_type);
    
    return {
      subject: `Payment Confirmed - ${bookingData.booking_ref}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1a1a1a; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">London Chauffeur Hire</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Payment Confirmed</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <div style="font-size: 24px; font-weight: bold; color: #1a1a1a;">LCH</div>
              </div>
              <h2 style="color: #1a1a1a; margin: 0;">Payment Successful!</h2>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px;">
              <p style="margin: 0; color: #856404; font-weight: bold;">Booking Reference: ${bookingData.booking_ref}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; margin-bottom: 15px;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Amount Paid:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #ffc107;">£${bookingData.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Payment Method:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Credit/Debit Card</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Payment Status:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #ffc107; font-weight: bold;">Paid</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Payment Date:</td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString('en-GB')}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #f8f9fa; border-left: 4px solid #1a1a1a; padding: 15px; margin-bottom: 25px;">
              <h4 style="margin: 0 0 10px 0; color: #1a1a1a;">${whatsNext.title}</h4>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                ${whatsNext.items.map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://next-chauffeur-app.vercel.app/booking/${bookingData.id}" style="background-color: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking Details</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
            <p>Thank you for your payment</p>
            <p>For any questions, please contact us at support@londonchauffeurhire.com</p>
          </div>
        </div>
      `
    };
  }
};

// Email sending functions
export const sendBookingConfirmationEmail = async (bookingData: any) => {
  try {
    const template = emailTemplates.bookingConfirmation(bookingData);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: bookingData.email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    throw error;
  }
};

export const sendPaymentConfirmationEmail = async (bookingData: any) => {
  try {
    const template = emailTemplates.paymentConfirmation(bookingData);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: bookingData.email,
      subject: template.subject,
      html: template.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Payment confirmation email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
};

// Combined function to send both emails
export const sendBookingAndPaymentEmails = async (bookingData: any) => {
  try {
    // Send booking confirmation email
    await sendBookingConfirmationEmail(bookingData);
    
    // Send payment confirmation email
    await sendPaymentConfirmationEmail(bookingData);
    
    console.log('Both booking and payment confirmation emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
}; 