require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const doctors = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    password: 'ChangeMe123!',
    role: 'doctor',
    specialty: 'Cardiology',
    experience: 12,
    qualification: 'MBBS, MD Cardiology',
    consultationFee: 800,
    image: '',
    isVerified: true,
  },
  {
    name: 'Priya Verma',
    email: 'priya.verma@example.com',
    password: 'ChangeMe123!',
    role: 'doctor',
    specialty: 'Dermatology',
    experience: 9,
    qualification: 'MBBS, MD Dermatology',
    consultationFee: 600,
    image: '',
    isVerified: true,
  },
  {
    name: 'Amit Gupta',
    email: 'amit.gupta@example.com',
    password: 'ChangeMe123!',
    role: 'doctor',
    specialty: 'Orthopedic',
    experience: 15,
    qualification: 'MBBS, MS Orthopedics',
    consultationFee: 700,
    image: '',
    isVerified: true,
  },
  {
    name: 'Neha Kapoor',
    email: 'neha.kapoor@example.com',
    password: 'ChangeMe123!',
    role: 'doctor',
    specialty: 'Pediatrics',
    experience: 8,
    qualification: 'MBBS, MD Pediatrics',
    consultationFee: 500,
    image: '',
    isVerified: true,
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    password: 'ChangeMe123!',
    role: 'doctor',
    specialty: 'General Physician',
    experience: 10,
    qualification: 'MBBS, MD Medicine',
    consultationFee: 500,
    image: '',
    isVerified: true,
  },
];

async function addDoctors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const doctor of doctors) {
      const existing = await User.findOne({
        email: doctor.email,
      });

      if (existing) {
        console.log(`Already exists: ${doctor.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        doctor.password,
        12
      );

      await User.create({
        ...doctor,
        password: hashedPassword,
      });

      console.log(`Added: ${doctor.name}`);
    }

    console.log('Doctor seeding completed.');
  } catch (error) {
    console.error('Error adding doctors:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

addDoctors();