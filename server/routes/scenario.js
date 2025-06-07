const express = require("express");
const router = express.Router();

const { authenticate, requireRole } = require("../middleware/auth");
const Scenario = require("../models/Scenario");

// ✅ Create a scenario (Admin only)
router.post("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;
    const newScenario = new Scenario({ title, description, assignedTo });
    await newScenario.save();
    res.status(201).json(newScenario);
  } catch (err) {
    console.error("Error creating scenario:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get all scenarios (Authenticated users)
router.get("/", authenticate, async (req, res) => {
  try {
    const scenarios = await Scenario.find();
    res.status(200).json(scenarios);
  } catch (err) {
    console.error("Error fetching scenarios:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete a scenario (Admin only)
router.delete("/:id", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const deleted = await Scenario.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Scenario not found" });
    }
    res.json({ message: "Scenario deleted successfully" });
  } catch (error) {
    console.error("Error deleting scenario:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
