const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  username: { type: String, required: true },
  flatNo: { type: String, required: true },
  wing: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'inprogress', 'solved'],
    default: 'pending',
  },
  adminResponse: { type: String, default: '' },
  submittedDate: { type: Date, default: Date.now },
  evidenceImage: {
    data: String, // base64 image string
    contentType: String,
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
