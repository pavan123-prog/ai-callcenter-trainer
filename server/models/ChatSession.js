const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
  csr: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scenario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scenario",
    required: true,
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ["csr", "bot"],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },

  // ✅ Store structured feedback object (score, suggestions, flags, raw, etc.)
  feedback: {
    type: mongoose.Schema.Types.Mixed, // <-- Updated here
    default: null,
  },
});

// ✅ Logging Middleware
chatSessionSchema.pre("save", function (next) {
  console.log(
    `ChatSession pre-save: session id=${this._id} | messages=${this.messages.length}`
  );
  next();
});

chatSessionSchema.post("save", function (doc) {
  console.log(`ChatSession post-save: session id=${doc._id}`);
});

chatSessionSchema.pre("findOne", function (next) {
  console.log(`ChatSession pre-findOne:`, this.getQuery());
  next();
});

chatSessionSchema.pre("findById", function (next) {
  console.log(`ChatSession pre-findById: id=${this.getQuery()._id}`);
  next();
});

module.exports = mongoose.models.ChatSession || mongoose.model("ChatSession", chatSessionSchema);
