require('dotenv').config(); // ✅ Load .env first, early in the file

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());
const feedbackRoutes = require("./routes/feedback");
app.use("/api/feedback", feedbackRoutes); // 💥 This is the missing line!


const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ MongoDB connected");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ Import routes
const authRoutes = require("./routes/auth");
const scenarioRoutes = require("./routes/scenario");
const chatRoutes = require("./routes/chat"); // ✅ No try-catch

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/scenarios", scenarioRoutes);
app.use("/api/chat", chatRoutes); // ✅ Will work now

const sessionRoutes = require("./routes/sessions");
app.use("/api/sessions", sessionRoutes);


// ✅ Root test
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
