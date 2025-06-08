const express = require("express");
const router = express.Router();
const ChatSession = require("../models/ChatSession");
const { authenticate, requireRole } = require("../middleware/auth");

// Admin: Get all sessions
router.get("/", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const sessions = await ChatSession.find()
      .populate("csr", "name email")
      .populate("scenario", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(sessions);
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  CSR: Get sessions for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const sessions = await ChatSession.find({ csr: req.params.userId }).populate('scenario');
    res.json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching sessions' });
  }
});

//  CSR/Admin: Get single session (used in Feedback.jsx for transcript)
//  CSR/Admin: Get single session (used in Feedback.jsx for transcript)
router.get('/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;
  console.log(` GET /api/sessions/${sessionId} called`);

  try {
    const session = await ChatSession.findById(sessionId).populate('scenario');
    if (!session) {
      console.log(" Session not found for ID:", sessionId);
      return res.status(404).json({ error: 'Session not found' });
    }

    console.log(" Session found:", session._id);
    res.status(200).json(session);
  } catch (error) {
    console.error(' Error fetching session:', error);
    res.status(500).json({ error: 'Server error fetching session' });
  }
});

module.exports = router;
