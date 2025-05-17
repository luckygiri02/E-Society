const express = require('express');
const multer = require('multer');
const Property = require('../models/Property');
const router = express.Router();

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

// Create Property
router.post('/', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]), async (req, res) => {
  try {
    const { flatNo, wing, userName, mobileNumber, price, type, eligibility, visitTime } = req.body;

    // Process files
    const images = (req.files['images'] || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    const videos = (req.files['videos'] || []).map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));

    const property = new Property({
      flatNo,
      wing,
      userName,
      mobileNumber,
      price,
      type,
      eligibility,
      visitTime,
      images,
      videos
    });

    await property.save();
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: property.toObject({ virtuals: true })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create property'
    });
  }
});

// Get all properties
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      properties: properties.map(p => p.toObject({ virtuals: true }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch properties'
    });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    res.json({
      success: true,
      property: property.toObject({ virtuals: true })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch property'
    });
  }
});

// Get properties by mobile number
router.get('/user/:mobileNumber', async (req, res) => {
  try {
    const properties = await Property.find({ mobileNumber: req.params.mobileNumber })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      properties: properties.map(p => p.toObject({ virtuals: true }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch properties'
    });
  }
});

// Serve media files
// Serve media files
router.get('/media/:id/:type/:index', async (req, res) => {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) return res.status(404).send('Property not found');
  
      const mediaArray = req.params.type === 'image' ? property.images : property.videos;
      const media = mediaArray[req.params.index];
      
      if (!media) return res.status(404).send('Media not found');
  
      res.set('Content-Type', media.contentType);
      res.send(media.data);
    } catch (error) {
      console.error('Error serving media:', error);
      res.status(500).send('Server error');
    }
  });
// Update property
// routes/properties.js
router.put('/:id', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]), async (req, res) => {
  try {
    const updates = req.body;
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Handle images
    if (req.files['images']) {
      updates.images = [
        ...req.files['images'].map(file => ({
          data: file.buffer,
          contentType: file.mimetype
        }))
      ];
    }

    // Handle videos
    if (req.files['videos']) {
      updates.videos = [
        ...req.files['videos'].map(file => ({
          data: file.buffer,
          contentType: file.mimetype
        }))
      ];
    }

    // Process existing media (from the form data)
    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      updates.images = [
        ...(updates.images || []),
        ...existingImages.map(img => property.images[img.index])
      ];
    }

    if (req.body.existingVideos) {
      const existingVideos = JSON.parse(req.body.existingVideos);
      updates.videos = [
        ...(updates.videos || []),
        ...existingVideos.map(vid => property.videos[vid.index])
      ];
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update property'
    });
  }
});
// Delete property
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }
    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete property'
    });
  }
});

module.exports = router;