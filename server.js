require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Константы для API
const CLAUDE_API = {
    URL: 'https://api.anthropic.com/v1/messages',
    KEY: process.env.CLAUDE_API_KEY,
    VERSION: '2023-06-01'
};

// Функция для работы с Claude API
async function callClaudeAPI(prompt) {
    console.log('Calling Claude API with prompt:', prompt);
    
    try {
        const response = await fetch(CLAUDE_API.URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': CLAUDE_API.VERSION,
                'x-api-key': CLAUDE_API.KEY
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                max_tokens_to_sample: 4000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', errorText);
            throw new Error(`API response not ok: ${errorText}`);
        }

        const data = await response.json();
        console.log('Claude API response:', data);

        if (!data.content || !data.content[0] || !data.content[0].text) {
            throw new Error('Invalid API response format');
        }

        return data.content[0].text;
    } catch (error) {
        console.error('Error calling Claude API:', error);
        throw error;
    }
}

// Создаем шаблон проекта часов
const clockTemplate = {
    "index.html": `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Digital Clock</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
            <div class="clock-container">
                <div id="clock" class="clock"></div>
            </div>
            <script src="script.js"></script>
        </body>
        </html>
    `,
    "style.css": `
        body {
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #1a1a1a;
        }
        .clock {
            font-family: Arial, sans-serif;
            font-size: 15vw;
            color: #33ff33;
            text-shadow: 0 0 20px rgba(51, 255, 51, 0.5);
        }
    `,
    "script.js": `
        function updateClock() {
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            document.getElementById('clock').textContent = time;
        }
        setInterval(updateClock, 1000);
        updateClock();
    `
};

// API endpoints
app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log('Generating structure for:', description);

        // Если это часы - используем готовый шаблон
        if (description.toLowerCase().includes('час') || description.toLowerCase().includes('clock')) {
            res.json({
                name: "digital-clock",
                files: clockTemplate
            });
            return;
        }

        // Иначе генерируем с помощью Claude
        const prompt = `Create a web application structure for: ${description}.
        Return only a JSON object with this structure:
        {
            "name": "project-name",
            "files": {
                "index.html": "complete HTML code",
                "style.css": "complete CSS code",
                "script.js": "complete JavaScript code"
            }
        }`;

        const result = await callClaudeAPI(prompt);
        const structure = JSON.parse(result);
        res.json(structure);

    } catch (error) {
        console.error('Structure generation error:', error);
        res.status(500).json({
            error: 'Failed to generate structure',
            details: error.message
        });
    }
});

// Добавляем простой UI для тестирования
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Project Generator</title>
            <style>
                body { max-width: 800px; margin: 40px auto; padding: 20px; font-family: Arial; }
                textarea { width: 100%; height: 100px; margin: 10px 0; }
                button { padding: 10px 20px; }
                pre { background: #f5f5f5; padding: 20px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <h1>Project Generator</h1>
            <textarea id="description" placeholder="Describe your project..."></textarea>
            <br>
            <button onclick="generate()">Generate Project</button>
            <pre id="output"></pre>

            <script>
                async function generate() {
                    const description = document.getElementById('description').value;
                    try {
                        const response = await fetch('/api/generate-structure', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ description })
                        });
                        const data = await response.json();
                        document.getElementById('output').textContent = 
                            JSON.stringify(data, null, 2);
                    } catch (error) {
                        document.getElementById('output').textContent = 
                            'Error: ' + error.message;
                    }
                }
            </script>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API configuration:', {
        url: CLAUDE_API.URL,
        keyStatus: !!CLAUDE_API.KEY,
        version: CLAUDE_API.VERSION
    });
});