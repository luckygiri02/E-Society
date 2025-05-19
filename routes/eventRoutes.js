const express = require("express");
const router = express.Router();
const multer = require("multer");
const Event = require("../models/Event");

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  }
});

// POST: Create a new event
router.post("/", upload.fields([{ name: "images", maxCount: 5 }, { name: "videos", maxCount: 2 }]), async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    const imageFiles = req.files?.images || [];
    const videoFiles = req.files?.videos || [];

    if (!title || !date || !type) {
      return res.status(400).json({ error: "Title, date and type are required fields" });
    }

    const images = imageFiles.map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    const videos = videoFiles.map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    const newEvent = new Event({ title, description, date, type, images, videos });
    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully!",
      event: newEvent.toObject({ virtuals: true })
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
});

// GET: Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    const eventsWithMediaUrls = events.map(event => ({
      ...event.toObject({ virtuals: true }),
      mediaUrls: {
        images: event.images.map((_, index) => `/api/events/media/${event._id}/image/${index}`),
        videos: event.videos.map((_, index) => `/api/events/media/${event._id}/video/${index}`)
      }
    }));

    res.json({ success: true, events: eventsWithMediaUrls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    const eventWithMediaUrls = {
      ...event.toObject({ virtuals: true }),
      mediaUrls: {
        images: event.images.map((_, index) => `/api/events/media/${event._id}/image/${index}`),
        videos: event.videos.map((_, index) => `/api/events/media/${event._id}/video/${index}`)
      }
    };

    res.json({ success: true, event: eventWithMediaUrls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Update an event
router.put("/:id", upload.fields([{ name: "images", maxCount: 5 }, { name: "videos", maxCount: 2 }]), async (req, res) => {
  try {
    const { title, description, date, type, existingImages = [], existingVideos = [] } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    let parsedExistingImages = [];
    let parsedExistingVideos = [];

    try {
      if (typeof existingImages === "string" && existingImages.trim()) {
        parsedExistingImages = JSON.parse(existingImages);
      } else if (Array.isArray(existingImages)) {
        parsedExistingImages = existingImages;
      }
    } catch (e) {
      console.error("Error parsing existingImages:", e);
    }

    try {
      if (typeof existingVideos === "string" && existingVideos.trim()) {
        parsedExistingVideos = JSON.parse(existingVideos);
      } else if (Array.isArray(existingVideos)) {
        parsedExistingVideos = existingVideos;
      }
    } catch (e) {
      console.error("Error parsing existingVideos:", e);
    }

    const newImages = (req.files?.images || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    const newVideos = (req.files?.videos || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    const updatedImages = [
      ...parsedExistingImages.map(index => event.images[index]),
      ...newImages
    ];

    const updatedVideos = [
      ...parsedExistingVideos.map(index => event.videos[index]),
      ...newVideos
    ];

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.type = type || event.type;
    event.images = updatedImages;
    event.videos = updatedVideos;

    await event.save();

    res.json({
      success: true,
      message: "Event updated successfully!",
      event: event.toObject({ virtuals: true })
    });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
});

// DELETE: Delete an event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Serve event media
router.get("/media/:id/:type/:index", async (req, res) => {
  try {
    const { id, type, index } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).send("Event not found");
    }

    const mediaArray = type === "image" ? event.images : event.videos;
    const media = mediaArray?.[index];

    if (!media) {
      return res.status(404).send("Media not found");
    }

    let mediaBuffer;

    // Fix for Binary.createFromBase64 stored format
    if (media.data?._bsontype === "Binary" && media.data.buffer) {
      mediaBuffer = Buffer.from(media.data.buffer);
    } else if (Buffer.isBuffer(media.data)) {
      mediaBuffer = media.data;
    } else {
      return res.status(500).send("Unsupported media format");
    }

    res.set("Content-Type", media.contentType || "application/octet-stream");
    res.send(mediaBuffer);
  } catch (err) {
    console.error("Error serving media:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
