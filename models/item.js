const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
    relationship: String,
    fullName: String,
    mobileNumber: String,
  });
  
  const DocumentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    documentData: { type: String, required: true },
  });
  
  const ItemSchema = new mongoose.Schema({
    name: String,
    fullName: String,
    mobileNumber: String,
    email: String,
    flatNo: String,
    wingNumber: String,
    role: String,
    occupation: String,
    adharCard: String,
    password: String,
    location: String,
    visittime: {
      type: Date,
      default: Date.now,
    },
    relation: String,
    purpose: String,
    familyMembers: [FamilyMemberSchema],
    documents: [DocumentSchema],
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("Item", ItemSchema);
  