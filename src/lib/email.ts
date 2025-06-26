import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services like 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app password
  },
});

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
          
          <div style="background-color: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #155724; font-weight: bold;">Booking Reference: ${bookingData.booking_ref}</p>
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
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #28a745;">£${bookingData.amount}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">Important Information</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Please arrive 10 minutes before your scheduled pickup time</li>
              <li>Your driver will contact you 30 minutes before pickup</li>
              <li>Have your booking reference ready: <strong>${bookingData.booking_ref}</strong></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://next-chauffeur-app.vercel.app" style="background-color: #1a1a1a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Website</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          <p>Thank you for choosing London Chauffeur Hire</p>
          <p>For any questions, please contact us at support@londonchauffeurhire.com</p>
        </div>
      </div>
    `
  }),
  
  paymentConfirmation: (bookingData: any) => ({
    subject: `Payment Confirmed - ${bookingData.booking_ref}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #28a745; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">London Chauffeur Hire</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Payment Confirmed</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 25px;">
            <div style="background-color: #d4edda; border: 2px solid #c3e6cb; border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 40px; color: #28a745;">✓</span>
            </div>
            <h2 style="color: #28a745; margin: 0;">Payment Successful!</h2>
          </div>
          
          <div style="background-color: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 25px;">
            <p style="margin: 0; color: #155724; font-weight: bold;">Booking Reference: ${bookingData.booking_ref}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #333; margin-bottom: 15px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 40%;">Amount Paid:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #28a745;">£${bookingData.amount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Payment Method:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Credit/Debit Card</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Payment Status:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #28a745; font-weight: bold;">Paid</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Payment Date:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${new Date().toLocaleString('en-GB')}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin-bottom: 25px;">
            <h4 style="margin: 0 0 10px 0; color: #0c5460;">What's Next?</h4>
            <ul style="margin: 0; padding-left: 20px; color: #0c5460;">
              <li>Your booking is now confirmed and payment is processed</li>
              <li>You will receive driver details 24 hours before your journey</li>
              <li>Keep this email for your records</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://next-chauffeur-app.vercel.app" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Booking Details</a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
          <p>Thank you for your payment</p>
          <p>For any questions, please contact us at support@londonchauffeurhire.com</p>
        </div>
      </div>
    `
  })
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