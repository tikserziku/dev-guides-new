require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

// Маршрут для главной страницы генератора
app.get('/generator', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API для генерации структуры
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
                max_tokens: 4000,
                messages: [{
                    role: "user",
                    content: `Create a detailed project structure for this web application: ${description}
                    Return response ONLY as a JSON object in this exact format:
                    {
                        "name": "project-name",
                        "structure": {
                            "files": [
                                {
                                    "path": "file path",
                                    "description": "file purpose",
                                    "content": "full file content"
                                }
                            ],
                            "dependencies": {
                                "required": ["dependency1", "dependency2"]
                            }
                        }
                    }`
                }]
            })
        });

        const data = await response.json();
        console.log("Structure response:", data);

        if (data.error) {
            throw new Error(data.error.message);
        }

        res.json(JSON.parse(data.content[0].text));
    } catch (error) {
        console.error("Structure generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

// API для генерации кода
app.post("/api/generate-code", async (req, res) => {
    try {
        const { structure, description } = req.body;
        console.log("Generating code for:", structure);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                max_tokens: 4000,
                messages: [{
                    role: "user",
                    content: `Generate complete, production-ready code for this project: ${description}
                    Project structure: ${JSON.stringify(structure)}
                    Return ONLY a JSON object where keys are file paths and values are complete file contents.`
                }]
            })
        });

        const data = await response.json();
        console.log("Code response:", data);

        if (data.error) {
            throw new Error(data.error.message);
        }

        res.json(JSON.parse(data.content[0].text));
    } catch (error) {
        console.error("Code generation error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key status:', CLAUDE_API_KEY ? 'Present' : 'Missing');
});
