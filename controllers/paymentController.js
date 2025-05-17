const Razorpay = require('razorpay');
const Payment = require('../models/Payment');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    
    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyAndSavePayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      currency,
      customer_name,
      customer_email,
      customer_contact,
      description,
      status
    } = req.body;
    
    // Add signature verification in production
    const payment = new Payment({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount,
      currency,
      customer_name,
      customer_email,
      customer_contact,
      description,
      status
    });
    
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};