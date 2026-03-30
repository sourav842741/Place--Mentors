import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // 🔥 performance improve
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // Google user ke liye password optional
      },
    },

    googleId: {
      type: String, // 🔥 add this (important)
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      type: String,
      default: "", // optional safe default
    },

    coverImage: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      required: true, // 🔥 IMPORTANT (tumhari requirement)
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one skill is required",
      },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verifyOtp: String,
    verifyOtpExpires: Date,

    resetOtp: String,
    resetOtpExpires: Date,

    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    socketId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);