const express = require('express');
const Notice = require('../models/Notice');
const mongoose = require('mongoose');

const router = express.Router();

// CREATE notice
router.post('/', async (req, res) => {
  try {
    // Convert empty string to empty array for targetUsers
    if (req.body.targetUsers === '') {
      req.body.targetUsers = [];
    }

    const newNotice = new Notice({
      ...req.body,
      postedAt: new Date() // Ensure postedAt is set
    });

    await newNotice.save();
    res.status(201).json(newNotice);
  } catch (err) {
    console.error('Error creating notice:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors 
    });
  }
});

// READ notices with filters
router.get('/', async (req, res) => {
  try {
    const { 
      audienceType, 
      targetArea, 
      category, 
      priority, 
      status 
    } = req.query;

    const filter = {};
    if (audienceType) filter.audienceType = audienceType;
    if (targetArea) filter.targetArea = targetArea;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const notices = await Notice.find(filter)
      .sort({ priority: -1, postedAt: -1 })
      ;

    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single notice by ID
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('targetUsers', 'name email')
      .populate('comments.user', 'name');

    if (!notice) return res.status(404).json({ message: 'Notice not found' });
    
    // Increment views count
    notice.views += 1;
    await notice.save();
    
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE notice
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    
    if (updates.deadline) {
      updates.status = new Date(updates.deadline) > new Date() ? 'active' : 'expired';
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('targetUsers', 'name email');

    if (!updatedNotice) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice updated successfully', notice: updatedNotice });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE notice
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Notice not found' });
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment to notice
// Add comment to notice
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, text } = req.body;
    
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: userId, text } } },  // Fixed missing closing brace
      { new: true }
    ).populate('comments.user', 'name');

    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update notice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(notice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;