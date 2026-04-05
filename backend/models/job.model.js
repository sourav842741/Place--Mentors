import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    type: String,
    default: "Not disclosed"
  },
  description: {
    type: String,
    trim: true
  },
  applyLink: {
    type: String,
    trim: true,
    unique: true // 
  },
  source: {
    type: String,
    default: "Adzuna",
    index: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },

  // 🔥 AUTO DELETE FIELD
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 8 * 60 * 60 * 1000)
  }

}, {
  timestamps: true
});

//  (AUTO DELETE)
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Text search
jobSchema.index({ title: 'text', description: 'text', company: 'text' });

export default mongoose.model('Job', jobSchema);