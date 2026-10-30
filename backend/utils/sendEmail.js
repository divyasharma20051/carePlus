
const nodemailer = require('nodemailer');

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email is not configured. Set EMAIL_USER and EMAIL_PASS.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// Existing enquiry notification — preserved
async function sendAppointmentEmail(
  userEmail,
  userName,
  location,
  department,
  enquiryId
) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"CarePlus Hospital" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `CarePlus enquiry received (#${String(enquiryId).slice(-6).toUpperCase()})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h1 style="color:#087f8c">CarePlus Hospital</h1>
        <h2>Hello ${escapeHtml(userName)},</h2>
        <p>We received your enquiry. Our team will contact you soon.</p>
        <p><b>Location:</b> ${escapeHtml(location || '')}<br/>
        <b>Department:</b> ${escapeHtml(department || '')}</p>
        <p>Reference: ${escapeHtml(String(enquiryId).slice(-6).toUpperCase())}</p>
      </div>
    `
  });
}
async function testEmailConnection() {
  const transporter = getTransporter();
  await transporter.verify();
  console.log('Gmail SMTP connection successful.');
}

testEmailConnection().catch((error) => {
  console.error('Gmail SMTP connection failed:', error.message);
});
// New registration OTP email
async function sendRegistrationOTP(userEmail, otp) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"CarePlus Hospital" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'CarePlus email verification code',
    text: `Your CarePlus signup verification code is ${otp}. It expires in 10 minutes. If you did not request this, ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">
        <h1 style="color:#087f8c">CarePlus Hospital</h1>
        <h2>Verify your email</h2>
        <p>Use this code to complete your CarePlus registration:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px 0">
          ${escapeHtml(otp)}
        </div>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `
  });
}

sendAppointmentEmail.sendRegistrationOTP = sendRegistrationOTP;

module.exports = sendAppointmentEmail;
