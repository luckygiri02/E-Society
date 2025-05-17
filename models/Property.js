const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  flatNo: { type: String, required: true },
  wing: { type: String, required: true },
  userName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  price: { type: String, required: true },
  type: { type: String, required: true, enum: ['Rent', 'Sale'] },
  eligibility: String,
  visitTime: String,
  images: [{
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
  }],
  videos: [{
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);