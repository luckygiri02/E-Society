const express =require('express') ;
const Complaint =require('../models/Complaint.js') ;

const router = express.Router();

// GET all complaints
router.get('/', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ submittedDate: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new complaint
router.post('/', async (req, res) => {
  try {
    const newComplaint = new Complaint(req.body);
    const saved = await newComplaint.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update a complaint by ID)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Complaint not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a complaint
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports= router;
