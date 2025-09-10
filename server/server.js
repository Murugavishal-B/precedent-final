// server/server.js

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the API endpoint
app.post('/gemini', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).send({ error: 'Text is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert legal analyst. Your task is to analyze a legal clause and provide a concise, easy-to-understand summary.
      Analyze the following legal text: "${text}"

      Provide your analysis in the following format:
      1.  A 5-bullet point summary of the key commitments, obligations, and risks.
      2.  A "Jargon Score" from 1 (very simple) to 10 (very complex), representing how difficult the text is for a layperson to understand.
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

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});