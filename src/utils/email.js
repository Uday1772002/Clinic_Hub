const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

// Send appointment notification email
const sendAppointmentEmail = async (to, subject, appointmentDetails) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      logger.warn("Email credentials not configured. Skipping email notification.");
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: generateAppointmentEmailHTML(appointmentDetails)
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}`);
  } catch (error) {
    logger.error("Error sending email:", error.message);
  }
};

// Generate HTML for appointment email
const generateAppointmentEmailHTML = (details) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .detail { margin: 10px 0; }
        .label { font-weight: bold; }
        .footer { margin-top: 20px; padding: 10px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ClinicHub Appointment Notification</h1>
        </div>
        <div class="content">
          <h2>${details.title}</h2>
          <p>${details.message}</p>
          <div class="detail">
            <span class="label">Patient:</span> ${details.patientName}
          </div>
          <div class="detail">
            <span class="label">Doctor:</span> ${details.doctorName}
          </div>
          <div class="detail">
            <span class="label">Date:</span> ${details.date}
          </div>
          <div class="detail">
            <span class="label">Time:</span> ${details.time}
          </div>
          <div class="detail">
            <span class="label">Reason:</span> ${details.reason}
          </div>
          ${details.status ? `<div class="detail"><span class="label">Status:</span> ${details.status}</div>` : ''}
        </div>
        <div class="footer">
          <p>This is an automated message from ClinicHub. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendAppointmentEmail
};
