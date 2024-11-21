require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log("Generating structure for:", description);
        console.log("Using API key:", CLAUDE_API_KEY); // Для отладки

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': CLAUDE_API_KEY
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                messages: [{
                    role: "user",
                    content: `Create a project structure for a web application: ${description}. 
                    Return only a JSON object with following structure:
                    {
                        "files": {
                            "index.html": "content here",
                            "style.css": "content here",
                            "script.js": "content here"
                        }
                    }`
                }],
                max_tokens: 4000,
                temperature: 0.7
            })
        });

        console.log("API Response Status:", response.status);
        const responseText = await response.text();
        console.log("Raw API Response:", responseText);

        try {
            const data = JSON.parse(responseText);
            console.log("Parsed API Response:", data);

            if (data.error) {
                throw new Error(data.error.message);
            }

            res.json(data);
        } catch (parseError) {
            console.error("Parse error:", parseError);
            res.status(500).json({ error: 'Invalid response format', details: responseText });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/generate-code", async (req, res) => {
    try {
        const { description, structure } = req.body;
        console.log("Generating code for:", description);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': CLAUDE_API_KEY
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                messages: [{
                    role: "user",
                    content: `Generate complete code for a web application: ${description}. 
                    Return only a JSON object with file contents.`
                }],
                max_tokens: 4000,
                temperature: 0.7
            })
        });

        const responseText = await response.text();
        console.log("Raw API Response:", responseText);

        try {
            const data = JSON.parse(responseText);
            console.log("Parsed API Response:", data);

            if (data.error) {
                throw new Error(data.error.message);
            }

            res.json(data);
        } catch (parseError) {
            console.error("Parse error:", parseError);
            res.status(500).json({ error: 'Invalid response format', details: responseText });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key status:', CLAUDE_API_KEY ? 'Present' : 'Missing');
    console.log('API Key first 10 chars:', CLAUDE_API_KEY ? CLAUDE_API_KEY.substring(0, 10) : 'Not available');
});
