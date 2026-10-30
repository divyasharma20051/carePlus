
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const User = require('../../models/user');
const RegistrationOTP = require('../../models/RegistrationOtp');
const sendEmail = require('../../utils/sendEmail');
const { publicUser, asyncHandler } = require('../../utils/controllerHelpers');

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_WAIT_MS = 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(email, otp) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return crypto
    .createHmac('sha256', secret)
    .update(`${email}:${otp}`)
    .digest('hex');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// STEP 1: Validate signup details and send an email OTP.
// IMPORTANT: This function does NOT create a User account.
exports.register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = req.body.role || 'patient';
  const specialty = String(req.body.specialty || '').trim();
  const experience =
    req.body.experience === '' ||
    req.body.experience === undefined ||
    req.body.experience === null
      ? 0
      : Number(req.body.experience);

  if (!name || !isValidEmail(email) || password.length < 6) {
    return res.status(400).json({
      message: 'Enter your name, a valid email and a password of at least 6 characters.'
    });
  }

  if (!['patient', 'doctor'].includes(role)) {
    return res.status(400).json({
      message: 'Choose patient or doctor registration.'
    });
  }

  if (
    role === 'doctor' &&
    (!specialty || !Number.isFinite(experience) || experience < 0)
  ) {
    return res.status(400).json({
      message: 'Enter a valid doctor specialty and experience.'
    });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      message: 'An account with this email already exists.'
    });
  }

  const now = Date.now();

  const existingOTP = await RegistrationOTP.findOne({ email });

  if (
    existingOTP &&
    now - new Date(existingOTP.lastSentAt).getTime() < RESEND_WAIT_MS
  ) {
    return res.status(429).json({
      message: 'Please wait 60 seconds before requesting another OTP.'
    });
  }

  const otp = generateOTP();

  // Store only the hashed password in the pending registration record.
  const passwordHash = await bcrypt.hash(password, 12);

  const pendingUser = {
    name,
    email,
    passwordHash,
    role,
    specialty: role === 'doctor' ? specialty : undefined,
    experience: role === 'doctor' ? experience : undefined
  };

  // Send the email before saving the pending registration.
  // If email delivery fails, no new account is created.
  try {
    await sendEmail.sendRegistrationOTP(email, otp);
  } catch (error) {
    console.error('Registration OTP email failed:', error.message);

    return res.status(503).json({
      message: 'Could not send the verification email. Check email configuration and try again.'
    });
  }

  await RegistrationOTP.findOneAndUpdate(
    { email },
    {
      $set: {
        otpHash: hashOTP(email, otp),
        pendingUser,
        expiresAt: new Date(now + OTP_EXPIRY_MS),
        attempts: 0,
        lastSentAt: new Date(now)
      },
      $setOnInsert: {
        resendCount: 0
      }
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  return res.status(200).json({
    message: 'OTP sent to your email. Verify it to complete registration.',
    otpRequired: true,
    email
  });
});

// STEP 2: Verify OTP and create the account only after successful verification.
exports.verifyRegistrationOTP = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const otp = String(req.body.otp || '').trim();

  if (!isValidEmail(email) || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      message: 'Enter a valid email and the 6-digit OTP.'
    });
  }

  const pending = await RegistrationOTP.findOne({ email });

  if (!pending) {
    return res.status(400).json({
      message: 'OTP not found or expired. Please register again.'
    });
  }

  if (new Date(pending.expiresAt).getTime() <= Date.now()) {
    await RegistrationOTP.deleteOne({ _id: pending._id });

    return res.status(400).json({
      message: 'OTP has expired. Please register again.'
    });
  }

  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    await RegistrationOTP.deleteOne({ _id: pending._id });

    return res.status(429).json({
      message: 'Too many incorrect OTP attempts. Please register again.'
    });
  }

  const expectedHash = hashOTP(email, otp);
  const suppliedHash = pending.otpHash;

  const matches =
    typeof suppliedHash === 'string' &&
    suppliedHash.length === expectedHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(suppliedHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );

  if (!matches) {
    pending.attempts += 1;

    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      await RegistrationOTP.deleteOne({ _id: pending._id });

      return res.status(429).json({
        message: 'Too many incorrect OTP attempts. Please register again.'
      });
    }

    await pending.save();

    return res.status(400).json({
      message: `Incorrect OTP. ${MAX_OTP_ATTEMPTS - pending.attempts} attempts remaining.`
    });
  }

  // Check again because the email could have been registered meanwhile.
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    await RegistrationOTP.deleteOne({ _id: pending._id });

    return res.status(409).json({
      message: 'An account with this email already exists.'
    });
  }

  const data = pending.pendingUser;

  try {
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.passwordHash,
      role: data.role,
      specialty: data.role === 'doctor' ? data.specialty : undefined,
      experience: data.role === 'doctor' ? data.experience : undefined,

      // Preserve existing behavior:
      // Patients can log in after email verification.
      // Doctors still need admin approval.
      isVerified: data.role === 'patient'
    });

    await RegistrationOTP.deleteOne({ _id: pending._id });

    return res.status(201).json({
      message:
        data.role === 'doctor'
          ? 'Email verified. Registration complete; your doctor account is pending admin approval.'
          : 'Email verified and account created successfully. You can log in now.',
      user: publicUser(user)
    });
  } catch (error) {
    // Handle the unique-email constraint if two requests race.
    if (error.code === 11000) {
      await RegistrationOTP.deleteOne({ _id: pending._id });

      return res.status(409).json({
        message: 'An account with this email already exists.'
      });
    }

    throw error;
  }
});
