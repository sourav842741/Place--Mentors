import mongoose from "mongoose";

const cronStateSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
  lastRun: {
    type: Date,
    default: null,
  },
});

export default mongoose.model("CronState", cronStateSchema);
