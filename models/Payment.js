const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  razorpay_payment_id: { type: String, required: true },
  razorpay_order_id: { type: String, required: true },
  razorpay_signature: { type: String, required: true },
  amount: { type: String, required: true },
  currency: { type: String, default: 'INR' },
  customer_name: { type: String, required: true },
  customer_email: { type: String },
  customer_contact: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: 'success' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
