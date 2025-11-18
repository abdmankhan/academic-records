const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'university', 'student', 'verifier'],
    default: 'student'
  },
  studentId: {
    type: String,
    trim: true,
    uppercase: true
  },
  organization: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ username: 1 });
userSchema.index({ studentId: 1 });

module.exports = mongoose.model('User', userSchema);


