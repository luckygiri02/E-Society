const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  message: { 
    type: String, 
    required: true,
    trim: true
  },
  postedBy: { 
    type: String, 
    required: true,
    trim: true
  },
  postedAt: { 
    type: Date, 
    default: Date.now 
  },
  deadline: { 
    type: Date, 
    required: true 
  },
  audienceType: {
    type: String,
    default: 'global'
  },
  targetArea: {
    type: String,
    default: 'homepage'
  },
  targetUsers: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    default: 'general'
  },
  priority: {
    type: String,
    default: 'medium'
  },
  status: {
    type: String,
    default: 'active'
  }
});

// Automatic status update
noticeSchema.pre('save', function(next) {
  if (this.deadline < new Date()) {
    this.status = 'expired';
  }
  next();
});

module.exports = mongoose.model('Notice', noticeSchema);