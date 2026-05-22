const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true
  },
  answer: {
    type: String,
    required: [true, 'Answer is required']
  },
  code: {
    type: String,
    default: null
  },
  language: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  feedback: {
    type: String,
    default: null
  },
  aiFeedback: {
    type: String,
    default: null
  },
  timeTaken: {
    type: Number,
    default: 0 // seconds
  },
  attempts: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Compound index to ensure one answer per user per question
answerSchema.index({ user: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('Answer', answerSchema);