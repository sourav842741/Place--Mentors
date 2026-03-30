import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  skills: {
    type: [String],
    required: true,
  },
  otp: String,
  otpExpires: Date,
});

export default mongoose.model("TempUser", tempUserSchema);