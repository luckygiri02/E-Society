const express = require("express");
const router = express.Router();
const Item = require("../models/item");

// GET all items
router.get("/", async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// POST a new item
router.post("/", async (req, res) => {
    try {
      const {
        name,
        fullName,
        mobileNumber,
        email,
        flatNo,
        wingNumber,
        role,
        occupation,
        adharCard,
        password,
        location,
        visittime,
        relation,
        purpose,
        familyMembers,
        documents,
      } = req.body;
  
      const newItem = new Item({
        name,
        fullName,
        mobileNumber,
        email,
        flatNo,
        wingNumber,
        role,
        occupation,
        adharCard,
        password,
        location,
        visittime,
        relation,
        purpose,
        familyMembers,
        documents,
      });
  
      const savedItem = await newItem.save();
      res.status(201).json(savedItem);
    } catch (error) {
      console.error("❌ Error saving item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// PUT (Update) item by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE item by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
