import mongoose from 'mongoose';

const CallHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  phone: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['hr-interview', 'spoken-english', 'motivation', 'resume-screening'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  duration: {
    type: Number, // seconds
    default: 0
  },
  transcript: {
    type: String,
    default: ''
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  twilioCallSid: {
    type: String
  },
  videosdkMeetingId: {
    type: String
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for user history queries
CallHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('CallHistory', CallHistorySchema);

