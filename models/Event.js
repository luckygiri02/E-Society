const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  images: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
  videos: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
});

module.exports = mongoose.model("Event", eventSchema);
