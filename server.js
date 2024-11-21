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

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                messages: [{
                    role: "user",
                    content: `Create code for a web application: ${description}.
                    Return only a JSON object with this exact structure:
                    {
                        "name": "project-name",
                        "files": {
                            "index.html": "complete HTML code here",
                            "style.css": "complete CSS code here",
                            "script.js": "complete JavaScript code here"
                        }
                    }`
                }]
            })
        });

        console.log("API Response Status:", response.status);
        const responseText = await response.text();
        console.log("API Response Text:", responseText);

        try {
            const data = JSON.parse(responseText);
            console.log("Parsed Response:", data);

            if (data.error) {
                throw new Error(data.error.message);
            }

            // Get the actual content from Claude's response
            const content = data.content[0].text;
            console.log("Claude content:", content);

            // Parse the JSON from Claude's response
            const projectStructure = JSON.parse(content);
            res.json(projectStructure);
        } catch (parseError) {
            console.error("Parse error:", parseError);
            res.status(500).json({ 
                error: 'Failed to parse response',
                raw: responseText 
            });
        }
    } catch (error) {
        console.error("Request error:", error);
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
    console.log('API Key check:', CLAUDE_API_KEY?.startsWith('sk-ant-api'));
});
