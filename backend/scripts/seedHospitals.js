require('dotenv').config();
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const hospitals = [
  { name: 'CarePlus Hospital, West Delhi', location: 'West Delhi', address: 'West Delhi, Delhi NCR', image: '/images/hospitals/h1.jpg', rating: 4.8 },
  { name: 'CarePlus Hospital, Gurugram', location: 'Gurugram', address: 'Gurugram, Haryana', image: '/images/hospitals/h2.jpg', rating: 4.7 },
  { name: 'Signature Hospital, Gurugram', location: 'Gurugram', address: 'Gurugram, Haryana', image: '/images/hospitals/h3.jpg', rating: 4.7 },
  { name: 'CarePlus Hospital, Noida', location: 'Noida', address: 'Noida, Uttar Pradesh', image: '/images/hospitals/h4.jpg', rating: 4.6 },
  { name: 'CarePlus Hospital, Jaipur', location: 'Jaipur', address: 'Jaipur, Rajasthan', image: '/images/hospitals/h5.jpg', rating: 4.9 },
  { name: 'CarePlus Hospital, Sonipat', location: 'Sonipat', address: 'Sonipat, Haryana', image: '/images/hospitals/h6.jpg', rating: 4.5 },
  { name: 'CarePlus Hospital, Mohali', location: 'Mohali', address: 'Mohali, Punjab', image: '/images/hospitals/h7.jpg', rating: 4.7 },
  { name: 'Signature Hospital, Delhi NCR', location: 'Delhi NCR', address: 'Delhi NCR', image: '/images/hospitals/h8.jpg', rating: 4.8 },
];
(async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is missing in backend/.env');
    await mongoose.connect(process.env.MONGO_URI);
    for (const hospital of hospitals) await Hospital.updateOne({ name: hospital.name }, { $setOnInsert: hospital }, { upsert: true });
    console.log(`Hospital seed complete (${hospitals.length} records checked).`);
  } catch (error) { console.error('Hospital seed failed:', error.message); process.exitCode = 1; }
  finally { await mongoose.disconnect().catch(() => {}); }
})();
