require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/complete';

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log("Generating structure for:", description);

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY
            },
            body: JSON.stringify({
                prompt: `\n\nHuman: Create a project structure for this web application: ${description}
                Return ONLY a JSON object with this structure:
                {
                    "files": {
                        "index.html": "full file content",
                        "style.css": "full file content",
                        "script.js": "full file content"
                    }
                }

                Assistant: Here's the project structure as JSON:`,
                model: "claude-3-opus-20240229",
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
            res.json(data);
        } catch (parseError) {
            console.error("Parse error:", parseError);
            res.status(500).json({ 
                error: 'Invalid response format', 
                details: responseText 
            });
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
    console.log('API URL:', CLAUDE_API_URL);
});
