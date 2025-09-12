// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan'); // For request logging

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev')); // Logs incoming requests

// --- Initialize Gemini Client ---
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ Missing GEMINI_API_KEY in .env file');
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Routes ---
app.post('/gemini', async (req, res) => {
  try {
    const { history = [], text = '', fileUrl = '' } = req.body;

    // Validate input
    if (!text && !fileUrl) {
      return res.status(400).json({ error: 'Provide either text or a fileUrl' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Start chat session with history
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1500,
        temperature: 0.7, // add some creativity
      },
    });

    // Build prompt
    let prompt = text.trim();
    if (fileUrl) {
      prompt += `\n\n[System Note: The user has uploaded a file: ${fileUrl}. Please analyze it in context of our chat.]`;
    }

    // Send to Gemini
    const result = await chat.sendMessage(prompt);

    // Safely extract text
    const analysisText = result?.response?.text?.() || '⚠️ No response generated';

    res.json({ analysis: analysisText });
  } catch (error) {
    console.error('❌ Error in /gemini endpoint:', error);

    res.status(500).json({
      error: 'Failed to generate content from the AI model.',
      details: error.message || error,
    });
  }
});

// --- Server Start ---
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
