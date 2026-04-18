import mongoose from 'mongoose';

const fruitboxProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 15
  },
  completedLevels: [{
    type: Number,
    min: 1,
    max: 15
  }],
  totalXP: {
    type: Number,
    default: 0
  },
  lastPlayedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('FruitboxProgress', fruitboxProgressSchema);

