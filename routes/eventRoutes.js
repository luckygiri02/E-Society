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
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// POST: Create a new event
router.post("/", upload.fields([{ name: "images", maxCount: 5 }, { name: "videos", maxCount: 2 }]), async (req, res) => {
  try {
    const { title, description, date, type } = req.body;
    const imageFiles = req.files?.images || [];
    const videoFiles = req.files?.videos || [];

    // Validate required fields
    if (!title || !date || !type) {
      return res.status(400).json({ error: "Title, date and type are required fields" });
    }

    // Process media files
    const images = imageFiles.map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    const videos = videoFiles.map((file) => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    const newEvent = new Event({
      title,
      description,
      date,
      type,
      images,
      videos,
    });

    await newEvent.save();

    res.status(201).json({ 
      success: true,
      message: "Event created successfully!",
      event: newEvent.toObject({ virtuals: true })
    });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ 
      success: false,
      error: err.message || "Internal server error" 
    });
  }
});

// GET: Get all events (sorted by date)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    
    // Add media URLs to each event
    const eventsWithMediaUrls = events.map(event => ({
      ...event.toObject({ virtuals: true }),
      mediaUrls: {
        images: event.images.map((_, index) => `/api/events/media/${event._id}/image/${index}`),
        videos: event.videos.map((_, index) => `/api/events/media/${event._id}/video/${index}`)
      }
    }));

    res.json({ 
      success: true,
      events: eventsWithMediaUrls 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// GET: Get single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    // Add media URLs
    const eventWithMediaUrls = {
      ...event.toObject({ virtuals: true }),
      mediaUrls: {
        images: event.images.map((_, index) => `/api/events/media/${event._id}/image/${index}`),
        videos: event.videos.map((_, index) => `/api/events/media/${event._id}/video/${index}`)
      }
    };

    res.json({ 
      success: true,
      event: eventWithMediaUrls 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// PUT: Update an event
router.put("/:id", upload.fields([{ name: "images", maxCount: 5 }, { name: "videos", maxCount: 2 }]), async (req, res) => {
  try {
    const { title, description, date, type, existingImages = [], existingVideos = [] } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    let parsedExistingImages = [];
    let parsedExistingVideos = [];
    
    try {
      if (existingImages && existingImages.trim()) {
        parsedExistingImages = JSON.parse(existingImages);
      }
    } catch (e) {
      console.error("Error parsing existingImages:", e);
      parsedExistingImages = [];
    }
    
    try {
      if (existingVideos && existingVideos.trim()) {
        parsedExistingVideos = JSON.parse(existingVideos);
      }
    } catch (e) {
      console.error("Error parsing existingVideos:", e);
      parsedExistingVideos = [];
    }
    
    // Process new images
    const newImages = (req.files?.images || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    // Process new videos
    const newVideos = (req.files?.videos || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    // Combine existing and new media
    const updatedImages = [
      ...parsedExistingImages.map(index => event.images[index]),
      ...newImages
    ];

    const updatedVideos = [
      ...parsedExistingVideos.map(index => event.videos[index]),
      ...newVideos
    ];

    // Update event
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
    res.status(500).json({ 
      success: false,
      error: err.message || "Internal server error" 
    });
  }
});

// DELETE: Delete an event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        error: "Event not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Event deleted successfully!" 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// GET: Serve event media (images/videos)
router.get("/media/:id/:type/:index", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send("Event not found");
    }

    const mediaArray = req.params.type === 'image' ? event.images : event.videos;
    const media = mediaArray[req.params.index];
    
    if (!media) {
      return res.status(404).send("Media not found");
    }

    res.set('Content-Type', media.contentType);
    res.send(media.data);
  } catch (err) {
    console.error("Error serving media:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;