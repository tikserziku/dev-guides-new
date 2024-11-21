require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/complete';

// Добавляем обработку ошибок для статических файлов
app.get('*', (req, res, next) => {
    try {
        if (req.path === '/generator') {
            res.sendFile(path.join(__dirname, 'public', 'generator.html'));
        } else {
            next();
        }
    } catch (error) {
        console.error('Static file error:', error);
        res.status(500).send('Error loading page');
    }
});

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log("Generating structure for:", description);

        if (!CLAUDE_API_KEY) {
            throw new Error('CLAUDE_API_KEY is not set');
        }

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                prompt: `Create a detailed project structure for: ${description}`,
                max_tokens_to_sample: 4000,
                temperature: 0.7
            })
        });

        console.log("API Response Status:", response.status);
        const data = await response.json();
        console.log("API Response:", data);

        try {
            const structureJson = JSON.parse(data.completion || '{}');
            res.json(structureJson);
        } catch (parseError) {
            console.error('JSON Parse error:', parseError);
            res.json({ error: 'Invalid response format' });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/generate-code", async (req, res) => {
    try {
        const { structure, description } = req.body;
        console.log("Generating code for:", structure);

        if (!CLAUDE_API_KEY) {
            throw new Error('CLAUDE_API_KEY is not set');
        }

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                prompt: `Generate complete, production-ready code for: ${description}\nStructure: ${JSON.stringify(structure)}`,
                max_tokens_to_sample: 4000,
                temperature: 0.7
            })
        });

        console.log("API Response Status:", response.status);
        const data = await response.json();
        console.log("API Response:", data);

        try {
            const codeJson = JSON.parse(data.completion || '{}');
            res.json(codeJson);
        } catch (parseError) {
            console.error('JSON Parse error:', parseError);
            res.json({ error: 'Invalid response format' });
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('API Key status:', CLAUDE_API_KEY ? 'Present' : 'Missing');
    console.log('API URL:', CLAUDE_API_URL);
});
