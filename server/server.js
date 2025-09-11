const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// Increase the JSON payload limit to allow for longer chat histories
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/gemini', async (req, res) => {
  try {
    // The front-end now sends the chat history along with the new text
    const { history, text, fileUrl } = req.body;
    
    // User must provide at least some text or a file to analyze
    if (!text && !fileUrl) {
      return res.status(400).send({ error: 'Text input or a file is required.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Start a chat session with the user's previous messages for context
    const chat = model.startChat({
        history: history || [], // Use the provided history or start a new chat
        generationConfig: {
            maxOutputTokens: 1500, // Increased token limit for more detailed responses
        },
    });

    // Create the new prompt for the AI
    let prompt = text;

    // If a file was uploaded, add a special note to the prompt for the AI to consider
    if (fileUrl) {
        prompt += `\n\n[System Note: The user has uploaded a file relevant to this conversation. Please analyze it in the context of our chat. The file can be accessed at: ${fileUrl}]`;
    }

    // Send the new message to the ongoing chat session
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const analysisText = response.text();

    res.send({ analysis: analysisText });
  } catch (error) {
    console.error('Error in /gemini endpoint:', error);
    res.status(500).send({ error: 'Failed to generate content from the AI model.' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});

