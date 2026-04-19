import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    /* ===============================
       Maintenance Mode
    =============================== */
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    maintenanceTitle: {
      type: String,
      trim: true,
      default: "Under Maintenance",
    },

    maintenanceMessage: {
      type: String,
      trim: true,
      default:
        "We're working on improvements. Back soon! 🚀",
    },

    maintenanceImage: {
      type: String,
      trim: true,
      default: "",
    },

    maintenanceAllowAdminAccess: {
      type: Boolean,
      default: true,
    },

    /* ===============================
       Announcement Bar
    =============================== */
    announcementEnabled: {
      type: Boolean,
      default: false,
    },

    announcementText: {
      type: String,
      trim: true,
      default: "",
    },

    announcementImage: {
      type: String,
      trim: true,
      default: "",
    },

    announcementType: {
      type: String,
      enum: [
        "info",
        "warning",
        "success",
        "danger",
      ],
      default: "info",
    },

    announcementClosable: {
      type: Boolean,
      default: true,
    },

    announcementButtonText: {
      type: String,
      trim: true,
      default: "",
    },

    announcementButtonLink: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =====================================
   STATIC METHOD:
   Always return single settings doc
===================================== */
settingsSchema.statics.getSingleton =
  async function () {
    let settings =
      await this.findOne();

    if (!settings) {
      settings =
        await this.create({});
    }

    return settings;
  };

/* =====================================
   PREVENT MULTIPLE DOCUMENTS
===================================== */
settingsSchema.pre("save", async function () {
  if (!this.isNew) return;

  const count =
    await this.constructor.countDocuments();

  if (count > 0) {
    throw new Error(
      "Only one Settings document allowed"
    );
  }
});

const Settings =
  mongoose.models.Settings ||
  mongoose.model(
    "Settings",
    settingsSchema
  );

export default Settings;