const https = require('https');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Appointment = require('../models/appointment');
const Payment = require('../models/Payment');

function razorpayRequest(method, endpoint, payload) {
  return new Promise((resolve, reject) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return reject(new Error('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env.'));
    const body = payload ? Buffer.from(JSON.stringify(payload)) : null;
    const req = https.request({ hostname: 'api.razorpay.com', path: endpoint, method, auth: `${keyId}:${keySecret}`, headers: { 'Content-Type': 'application/json', ...(body ? { 'Content-Length': body.length } : {}) } }, response => {
      const chunks = []; response.on('data', c => chunks.push(c)); response.on('end', () => {
        let data = {}; try { data = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch {}
        if (response.statusCode < 200 || response.statusCode >= 300) return reject(new Error(data.error?.description || 'Razorpay request failed.'));
        resolve(data);
      });
    });
    req.on('error', reject); if (body) req.write(body); req.end();
  });
}

exports.createAppointmentPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.body || {};
    if (!mongoose.isValidObjectId(appointmentId)) return res.status(400).json({ message: 'Invalid appointment ID.' });
    const appointment = await Appointment.findById(appointmentId).populate('doctor', 'consultationFee');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    const ownsAppointment = (appointment.patient && String(appointment.patient) === String(req.session.user?._id)) || String(req.session.lastAppointmentId || '') === String(appointment._id);
    if (req.session.user?.role !== 'admin' && !ownsAppointment) return res.status(403).json({ message: 'You can only pay for an appointment created in your session or linked to your account.' });
    const amountRupees = Number(appointment.doctor?.consultationFee || 500);
    if (!Number.isFinite(amountRupees) || amountRupees < 1) return res.status(400).json({ message: 'Invalid consultation fee.' });
    const order = await razorpayRequest('POST', '/v1/orders', { amount: Math.round(amountRupees * 100), currency: 'INR', receipt: `appt_${String(appointment._id).slice(-18)}`, notes: { appointmentId: String(appointment._id) } });
    await Payment.create({ appointment: appointment._id, patient: appointment.patient || req.session.user?._id, razorpayOrderId: order.id, amount: amountRupees });
    res.status(201).json({ keyId: process.env.RAZORPAY_KEY_ID, orderId: order.id, amount: order.amount, currency: order.currency, appointmentId: appointment._id });
  } catch (error) { res.status(502).json({ message: error.message || 'Unable to create payment order.' }); }
};

exports.verifyAppointmentPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ message: 'Payment verification details are incomplete.' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const a = Buffer.from(expected); const b = Buffer.from(String(razorpay_signature));
    if (!process.env.RAZORPAY_KEY_SECRET || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(400).json({ message: 'Payment signature verification failed.' });
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) return res.status(404).json({ message: 'Payment order not found.' });
    if (payment.status !== 'paid') {
      payment.razorpayPaymentId = razorpay_payment_id; payment.status = 'paid'; await payment.save();
      await Appointment.findByIdAndUpdate(payment.appointment, { status: 'Confirmed' });
    }
    res.json({ message: 'Payment verified successfully. Appointment confirmed.', paymentId: payment._id });
  } catch (error) { res.status(500).json({ message: 'Payment verification failed.' }); }
};
