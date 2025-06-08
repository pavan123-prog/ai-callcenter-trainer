const express = require("express");
const router = express.Router();
const ChatSession = require("../models/ChatSession");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

//  GET feedback for a specific session
router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (!session.feedback) return res.status(404).json({ error: "No feedback available for this session yet." });

    return res.status(200).json({ feedback: session.feedback });
  } catch (err) {
    console.error(" Error fetching feedback:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//  POST feedback generation for a specific session
router.post("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(" Generating feedback for session:", sessionId);

    const session = await ChatSession.findById(sessionId).populate("scenario");
    if (!session) return res.status(404).json({ error: "Session not found" });

    const scenarioDescription = session.scenario?.description || "No scenario description provided.";
    const conversation = session.messages.map((msg) => `${msg.sender.toUpperCase()}: ${msg.text}`).join("\n");

    const prompt = `
You are a professional call center QA evaluator. Evaluate the following CSR-customer conversation.

Scenario: ${scenarioDescription}

Conversation:
${conversation}

Please provide structured feedback in the following format:
1. Overall Score (1 to 10):
2. Rating (Excellent/Good/Poor):
3. Tone and Professionalism:
4. Empathy Shown:
5. Issue Resolution:
6. Escalation Handling:
7. Suggestions for Improvement:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    const rawFeedback = completion.choices[0].message.content.trim();

    const extractSection = (label) => {
      const match = rawFeedback.match(new RegExp(`${label}:\s*([^\n]*)`, "i"));
      return match ? match[1].trim() : "Not provided";
    };

    const feedbackObject = {
      score: parseInt(extractSection("Overall Score")) || 1,
      rating: extractSection("Rating"),
      strengths: [extractSection("Tone and Professionalism"), extractSection("Empathy Shown"), extractSection("Issue Resolution")],
      flags: [extractSection("Escalation Handling")],
      suggestions: [extractSection("Suggestions for Improvement")],
      raw: rawFeedback
    };

    session.feedback = feedbackObject;
    session.endedAt = new Date();
    await session.save();

    console.log(" Feedback generated and saved");
    return res.status(200).json({ message: "Feedback saved", feedback: feedbackObject });
  } catch (err) {
    console.error(" Error generating feedback:", err);
    return res.status(500).json({ error: "Failed to generate feedback", details: err.message });
  }
});

module.exports = router;
