const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Emergency Blood Platform - Password Reset OTP',
    text: `Your OTP for password reset is: ${otp}. This OTP is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #dc2626;">Emergency Blood Platform</h2>
        <p>You requested a password reset.</p>
        <p>Your OTP is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #dc2626;">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

const sendSOSAlert = async (email, donorName, requestDetails) => {
  const isSOS = requestDetails.isSOS;
  const subjectPrefix = isSOS ? "🚨 URGENT: SOS" : "🩸 URGENT: Blood";
  const headerColor = isSOS ? "#dc2626" : "#2563eb"; // Red for SOS, Blue for Normal
  const headerText = isSOS ? "🚨 SOS EMERGENCY 🚨" : "🩸 Blood Request Nearby";

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `${subjectPrefix} Request for ${requestDetails.bloodGroup}`,
    text: `Hello ${donorName},\n\nURGENT: A patient nearby needs ${requestDetails.bloodGroup} blood.\n\nHospital: ${requestDetails.hospital}\nDistance: ${requestDetails.distance} km\nContact: ${requestDetails.contactNumber}\n\nPlease login to the app to view details and help!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 4px solid ${headerColor}; border-radius: 10px;">
        <h1 style="color: ${headerColor}; text-align: center;">${headerText}</h1>
        <p>Hello <strong>${donorName}</strong>,</p>
        <p>A patient nearby needs your help!</p>
        
        <div style="background-color: ${isSOS ? '#fee2e2' : '#eff6ff'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Blood Group:</strong> <span style="font-size: 20px; font-weight: bold; color: ${headerColor};">${requestDetails.bloodGroup}</span></p>
          <p><strong>Hospital:</strong> ${requestDetails.hospital}</p>
          <p><strong>Distance:</strong> ${requestDetails.distance} km</p>
          <p><strong>Contact:</strong> <a href="tel:${requestDetails.contactNumber}" style="color: ${headerColor}; font-weight: bold;">${requestDetails.contactNumber}</a></p>
        </div>

        <p style="text-align: center;">
          <a href="https://digital-blood-emergency-platform.onrender.com/login" style="background-color: ${headerColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`SOS Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending SOS email:', error);
    return false;
  }
};

const sendDonorRequest = async (email, donorName, requestDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Blood Donation Request for ${requestDetails.bloodGroup}`,
    text: `Hello ${donorName},\n\nA receiver has sent you a blood donation request.\n\nBlood Group: ${requestDetails.bloodGroup}\nReceiver: ${requestDetails.receiverName}\nHospital: ${requestDetails.hospital}\nContact: ${requestDetails.contactNumber}\n\nPlease login to the app to view details and respond!`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #dc2626; border-radius: 10px;">
        <h1 style="color: #dc2626; text-align: center;">🩸 Blood Donation Request</h1>
        <p>Hello <strong>${donorName}</strong>,</p>
        <p>A receiver has sent you a blood donation request and would like your help.</p>
        
        <div style="background-color: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Blood Group:</strong> <span style="font-size: 20px; font-weight: bold; color: #dc2626;">${requestDetails.bloodGroup}</span></p>
          <p><strong>Receiver:</strong> ${requestDetails.receiverName}</p>
          <p><strong>Hospital:</strong> ${requestDetails.hospital}</p>
          <p><strong>Contact:</strong> <a href="tel:${requestDetails.contactNumber}" style="color: #dc2626; font-weight: bold;">${requestDetails.contactNumber}</a></p>
          ${requestDetails.message ? `<p><strong>Message:</strong> ${requestDetails.message}</p>` : ''}
        </div>

        <p style="text-align: center;">
          <a href="https://digital-blood-emergency-platform.onrender.com/login" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Request</a>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Donor Request Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending donor request email:', error);
    return false;
  }
};

module.exports = { sendOTP, sendSOSAlert, sendDonorRequest };

