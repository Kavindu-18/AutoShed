// services/emailService.js - UPDATED
import nodemailer from 'nodemailer';

// Create a transporter with your email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Function to send emails to multiple recipients
const sendBulkEmails = async (recipients, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      bcc: recipients, // Use BCC for privacy
      subject: subject,
      html: htmlContent
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending emails:', error);
    if (error.response) {
      console.error('SMTP response:', error.response);
    }
    if (error.responseCode) {
      console.error('SMTP response code:', error.responseCode);
    }
    return { success: false, error: error.message };
  }
};

// Use ES Modules export syntax instead of CommonJS
export { sendBulkEmails };