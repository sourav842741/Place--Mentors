import mongoose from "mongoose";

const topicNotesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  topic: {
    type: String,
    required: true
  },

  classLevel: String,
  examType: String,

  revisionMode: {
    type: Boolean,
    default: false
  },

  includeDiagram: Boolean,
  includeChart: Boolean,

  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }

}, { timestamps: true });

const TopicNotes = mongoose.model("TopicNotes", topicNotesSchema);

export default TopicNotes;