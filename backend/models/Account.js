// This is a simple schema representation of what an account might look like
// Depending on your database (MongoDB, SQL, etc.), implementation details may vary

const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Prospect', 'Target', 'Customer', 'Archived'],
    default: 'Prospect'
  },
  industry: {
    type: String,
    trim: true
  },
  revenue: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
accountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Account', accountSchema);