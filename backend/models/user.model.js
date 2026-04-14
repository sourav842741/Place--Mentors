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
      index: true, //  performance improve
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId; // Google user ke liye password optional
      },
    },

    googleId: {
      type: String, 
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    avatar: {
      type: String,
      default: "", 
    },

    coverImage: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      required: true, 
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

    //  STREAK
    streakCount: { type: Number, default: 0 },
    lastLoginDate: { type: Date, default: null },
    longestStreak: { type: Number, default: 0 },

    //  XP SYSTEM
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },

    // AI COACH FIELDS
    lastMotivation: { type: String, default: "" },
    lastMotivationDate: { type: Date, default: null },

      currentLevelXP: {
  type: Number,
  default: 0,
},

nextLevelXP: {
  type: Number,
  default: 100,
},

    //  BADGES
    badges: [
      {
        name: String,
        earnedAt: Date,
      },
    ],

    dailyStats: [
      {
        date: String, // "2026-04-03"
        timeSpent: {
          type: Number,
          default: 0,
        },
        avgScore: {
          type: Number,
          default: 0,
        },
        quizzesGiven: {
          type: Number,
          default: 0,
        },
      },
    ],
    //  Company Preparation Tracking
prepCompanies: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company"
  }
],
 notes:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:"Notes",
        default:[]

    },

    //  TIME TRACKING
    totalTimeSpent: { type: Number, default: 0 }, // minutes

    credits: {
      type: Number,
      default: 100,
    },

    //  POTD TRACKING
    potdCompleted: { type: Boolean, default: false },
    codingPotdCompleted: { type: Boolean, default: false },
    lastPotdDate: { type: String, default: null }, // YYYY-MM-DD
    lastCodingPotdDate: { type: String, default: null }, // YYYY-MM-DD
    lastPotdAt: { type: Date, default: null },
    lastCodingPotdAt: { type: Date, default: null },

    googleCalendarAccessToken: String,
    googleCalendarRefreshToken: String,

    // FRIENDS SYSTEM
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    
   friendRequests: {
  sent: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: []
  },
  received: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
    default: []
  }
},
  },

  { timestamps: true },
);

export default mongoose.model("User", userSchema);
