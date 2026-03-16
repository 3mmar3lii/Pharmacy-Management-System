const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true, 
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0, 
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'bank_transfer'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // who created/issued the invoice
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: add indexes for common query patterns
invoiceSchema.index({ order: 1 });
invoiceSchema.index({ issuedBy: 1, createdAt: -1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;