const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');



// In your backend routes (e.g., routes/payment.js)
const Razorpay = require('razorpay');
const razorpay = new Razorpay({
  key_id: 'rzp_test_JiSRo4AsuOLqwN',
  key_secret: '6sSQtUeIEFsDn3yiLj2whKoY'
});

// Create order endpoint
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    const options = {
      amount: amount, // amount in smallest currency unit (paise)
      currency: currency || 'INR',
      receipt: receipt,
      payment_capture: 1 // auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: err.error?.description || err.message
    });
  }
});
// Create
router.post('/', async (req, res) => {
    try {
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        amount,
        currency = 'INR', // Added default value
        customer_name,    // Changed from 'name'
        customer_email,   // Changed from 'email'
        customer_contact, // Changed from 'contact'
        description,
        status = 'success' // Added default value
      } = req.body;
  
      const newPayment = new Payment({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        amount,
        currency,
        customer_name,
        customer_email,
        customer_contact,
        description,
        status,
        created_at: new Date()
      });
  
      const savedPayment = await newPayment.save();
      res.status(201).json({ success: true, data: savedPayment });
    } catch (error) {
      console.error('Error saving payment:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Server error',
        error: error.message // Include error message in response
      });
    }
  });

// Read All
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ created_at: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Read One
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPayment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, data: updatedPayment });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.status(200).json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;