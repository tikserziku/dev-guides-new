require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Проверяем API ключ
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
console.log('API Key status:', CLAUDE_API_KEY ? 'Present' : 'Missing');

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log("Generating structure for:", description);

        if (!CLAUDE_API_KEY) {
            throw new Error('CLAUDE_API_KEY is not set');
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `Create a detailed project structure for a web application: ${description}. 
                    Return ONLY valid JSON structure.`
                }]
            })
        });

        console.log("Claude API response status:", response.status);
        const data = await response.json();
        console.log("Claude API response:", data);

        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }

        const structureJson = JSON.parse(data.content[0].text);
        res.json(structureJson);
    } catch (error) {
        console.error("Error in generate-structure:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
});
