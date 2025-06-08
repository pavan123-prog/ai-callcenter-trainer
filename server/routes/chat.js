const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

const ChatSession = require("../models/ChatSession");
const Scenario = require("../models/Scenario");
const { getBotReply } = require("../utils/openai");


const OpenAI = require("openai");
require("dotenv").config();

//  OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//  Logger Middleware
router.use((req, res, next) => {
  console.log(`[Chat Route] ${req.method} ${req.originalUrl}`);
  next();
});

//  Health check
router.get("/ping", (req, res) => {
  res.send("Chat route is active ");
});

//  Start a new chat session
router.post("/start", authenticate, async (req, res) => {
  try {
    const { scenarioId } = req.body;
    console.log(" Starting new session with scenarioId:", scenarioId);

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      console.log(" Scenario not found for ID:", scenarioId);
      return res.status(404).json({ error: "Scenario not found" });
    }

    const newSession = new ChatSession({
      csr: req.user.userId,
      scenario: scenario._id,
      messages: [
        {
          sender: "bot",
          text: scenario.description,
        },
      ],
      startedAt: new Date(),
    });

    await newSession.save();
    console.log(" Chat session created:", newSession._id);
    res.status(201).json(newSession);
  } catch (err) {
    console.error(" Error starting chat session:", err);
    res.status(500).json({ error: "Server error" });
  }
});

//  Send message and get AI reply
router.post("/:sessionId/message", authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(` Incoming message for sessionId=${sessionId}:`, message);

    const session = await ChatSession.findById(sessionId).populate("scenario");

    if (!session) {
      console.log(" Chat session not found:", sessionId);
      return res.status(404).json({ error: "Chat session not found" });
    }

    // Push CSR message
    session.messages.push({ sender: "csr", text: message });

    // Build enhanced prompt for realism
    const conversationHistory = session.messages
      .map((msg) => `${msg.sender === "csr" ? "CSR" : "Customer"}: ${msg.text}`)
      .join("\n");

    const prompt = `
You are simulating a realistic CUSTOMER in a call center training scenario. You must stay in character at all times.

 Scenario Description:
${session.scenario.description}

 Conversation So Far:
${conversationHistory}

 Customer Simulation Guidelines:
- Respond naturally, with personality and human emotion.
- Don't be too robotic or too perfect.
- If the CSR is unclear or makes a mistake, respond accordingly.
- Provide hints or context only if the CSR asks the right questions.
- Use short or long responses based on the conversation flow.
- You can express frustration, confusion, or urgency if needed.
- Avoid repeating the same response style too often.
- DO NOT say "I am an AI language model".

Now continue the conversation. As the CUSTOMER, reply realistically.
`;

    console.log(" Prompt to OpenAI:", prompt);

    let botReply = "";
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // or "gpt-4" if you upgrade
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85, // ⬆️ makes replies more human and varied
      });

      botReply = completion.choices[0].message.content.trim();
    } catch (openaiErr) {
      console.error(" OpenAI API error:", openaiErr.message);
      return res.status(500).json({ error: "AI service unavailable" });
    }

    console.log(" AI Reply:", botReply);

    session.messages.push({ sender: "bot", text: botReply });
    await session.save();

    console.log(" Chat session updated:", session._id);

    res.status(200).json({
      reply: botReply,
      session,
    });
  } catch (err) {
    console.error(" Server error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;
