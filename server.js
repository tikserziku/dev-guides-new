require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Проверяем API ключ
if (!process.env.CLAUDE_API_KEY) {
    console.error('CLAUDE_API_KEY is required in environment variables');
    process.exit(1);
}

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log("Generating structure for:", description);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `Create a detailed project structure for a fullstack web application: ${description}. 
                    Include all necessary files, their purposes, and required dependencies.
                    Return ONLY valid JSON in this format:
                    {
                        "name": "project-name",
                        "description": "Project description",
                        "structure": {
                            "frontend": [
                                {"path": "src/components/...", "content": "Purpose of the file"},
                            ],
                            "backend": [
                                {"path": "server/...", "content": "Purpose of the file"}
                            ],
                            "dependencies": {
                                "frontend": ["dep1", "dep2"],
                                "backend": ["dep1", "dep2"]
                            }
                        }
                    }`
                }]
            })
        });

        const data = await response.json();
        console.log("Claude response:", data);
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const structureJson = JSON.parse(data.content[0].text);
        res.json(structureJson);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/generate-code", async (req, res) => {
    try {
        const { structure, description } = req.body;
        console.log("Generating code for:", structure);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-opus-20240229',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: `Generate complete, production-ready code for this project: ${description}
                    Project structure: ${JSON.stringify(structure)}
                    Return ONLY valid JSON where keys are file paths and values are complete file contents.
                    Include all necessary imports, error handling, and comments.`
                }]
            })
        });

        const data = await response.json();
        console.log("Claude response:", data);

        if (data.error) {
            throw new Error(data.error.message);
        }

        const codeJson = JSON.parse(data.content[0].text);
        res.json(codeJson);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
