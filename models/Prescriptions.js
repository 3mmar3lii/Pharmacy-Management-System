const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,       // adjust if not always required
  },
  image: {
    type: String,
    required: true,       // typically an image URL or path
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'rejected'], // example statuses
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: add index for common queries
prescriptionSchema.index({ user: 1, createdAt: -1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;

