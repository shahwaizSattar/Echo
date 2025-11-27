const OTP = require('../models/OTP');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = async (email, otp, purpose, tempPassword = null) => {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.deleteMany({ email, purpose });

    const otpRecord = new OTP({
      email: email.toLowerCase(),
      otp,
      purpose,
      tempPassword,
      expiresAt
    });

    await otpRecord.save();
    console.log(`✅ OTP stored for ${email}`);
    return otpRecord;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
};

const verifyOTP = async (email, otp, purpose) => {
  try {
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      purpose
    });

    if (!otpRecord) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, message: 'Too many failed attempts. Please request a new OTP' };
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    return { valid: true, message: 'OTP verified', record: otpRecord };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

const deleteOTP = async (email, purpose) => {
  try {
    await OTP.deleteMany({
      email: email.toLowerCase(),
      purpose
    });
    console.log(`✅ OTP deleted for ${email}`);
  } catch (error) {
    console.error('Error deleting OTP:', error);
    throw error;
  }
};

const markOTPAsVerified = async (email, purpose) => {
  try {
    await OTP.updateOne(
      { email: email.toLowerCase(), purpose },
      { isVerified: true }
    );
    console.log(`✅ OTP marked as verified for ${email}`);
  } catch (error) {
    console.error('Error marking OTP as verified:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  deleteOTP,
  markOTPAsVerified
};
