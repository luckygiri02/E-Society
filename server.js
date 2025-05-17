const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require('body-parser');
require("dotenv").config();

// Route imports
const paymentRoutes = require("./routes/paymentRoutes");
const itemRoutes = require("./routes/itemRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const eventsRoutes = require("./routes/eventRoutes");
const complaintsRouter = require("./routes/complaintRoutes");
const noticeroutes = require("./routes/noticeRoutes")

const app = express();

// Middlewares
// app.use(bodyParser.json());
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Check for Mongo URI
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set in .env");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/items", itemRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/events", eventsRoutes);
app.use('/api/complaints', complaintsRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/notices',noticeroutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));