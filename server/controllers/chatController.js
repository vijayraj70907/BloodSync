const axios = require("axios");

const chat = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const chatHistory = (history || []).map((msg) => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are BloodSync's helpful AI assistant. You help users with questions about:
- Blood types and compatibility
- Blood donation eligibility and guidelines
- How BloodSync works (finding donors, posting requests, registering as donor)
- General blood donation facts and myths
- WHO donation guidelines (56 day cooldown, age limits, weight limits)

Keep answers short, friendly and helpful. Use simple language.
If someone asks something unrelated to blood donation or BloodSync, politely say you can only help with blood donation topics.
Never give specific medical advice — always suggest consulting a doctor for medical decisions.`
          },
          ...chatHistory,
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chat };