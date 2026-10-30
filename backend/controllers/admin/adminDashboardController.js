const User = require('../../models/user');
const Appointment = require('../../models/appointment');
const Enquiry = require('../../models/Enquiry');
const Hospital = require('../../models/Hospital');
const CareerApplication = require('../../models/CareerApplication');
const Payment = require('../../models/Payment');
const { asyncHandler } = require('../../utils/controllerHelpers');

exports.adminDashboard = asyncHandler(async (req, res) => {
  const [pendingDoctors, doctors, patients, appointments, enquiries, careerApplications, payments] = await Promise.all([
    User.find({ role: 'doctor', isVerified: false }).select('-password').sort({ createdAt: -1 }),
    User.find({ role: 'doctor', isVerified: true }).select('-password').sort({ createdAt: -1 }),
    User.find({ role: 'patient' }).select('-password').sort({ createdAt: -1 }),
    Appointment.find().populate('doctor', 'name specialty consultationFee').populate('patient', 'name email').sort({ createdAt: -1 }).limit(200),
    Enquiry.find().sort({ createdAt: -1 }).limit(100),
    CareerApplication.find().sort({ createdAt: -1 }).limit(200),
    Payment.find().populate('appointment', 'patientName appointmentDate').sort({ createdAt: -1 }).limit(200)
  ]);
  res.json({ stats: { pendingDoctors: pendingDoctors.length, doctors: doctors.length, patients: patients.length, appointments: appointments.length, enquiries: enquiries.length, careerApplications: careerApplications.length, payments: payments.length }, pendingDoctors, doctors, patients, appointments, enquiries, careerApplications, payments });
});
