// server/server.js

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/gemini', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).send({ error: 'Text is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // This is our new, much smarter prompt!
    const prompt = `
      You are Precedent-Pro, a helpful and friendly AI Legal Co-Pilot.

      First, analyze the user's input to determine their intent. There are two possibilities:
      1.  **Legal Analysis Request:** The user has provided a legal clause, a snippet of a contract, terms of service, or is asking a specific question about a legal process. The text will likely be long, formal, or contain legal jargon.
      2.  **General Conversation:** The user is asking a simple question, making a greeting (like "hi", "hello", "how are you"), or having a casual conversation.

      Based on the intent, respond in ONE of the following two ways:

      ---
      **IF the intent is "Legal Analysis Request":**
      Respond ONLY with the following structured format. Do not add any conversational text before or after this structure.
      **1. Five-Bullet Point Summary of Key Commitments, Obligations, and Risks:**
      * Point 1
      * Point 2
      * Point 3
      * Point 4
      * Point 5
      **2. Jargon Score:**
      A score from 1 (very simple) to 10 (very complex), with a brief explanation.

      ---
      **IF the intent is "General Conversation":**
      Respond in a friendly, helpful, and conversational tone. Do not use the structured legal analysis format. Be concise and natural, like a world-class chatbot.

      ---
      Here is the user's input: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    res.send({ analysis: analysisText });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to analyze text' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});