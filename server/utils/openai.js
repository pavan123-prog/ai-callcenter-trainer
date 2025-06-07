const axios = require("axios");

const getBotReply = async (scenarioDescription, conversationHistory) => {
  const prompt = `
You are a simulated customer in a call center training program.

Scenario:
${scenarioDescription}

Conversation so far:
${conversationHistory.map(msg => `${msg.sender.toUpperCase()}: ${msg.text}`).join('\n')}

Respond realistically as the CUSTOMER based on the scenario.
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI API error:", err.response?.data || err.message);
    return "Sorry, I’m having trouble responding right now.";
  }
};

module.exports = { getBotReply };
