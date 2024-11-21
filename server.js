const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Готовый шаблон часов (исправленный формат)
const clockTemplate = {
    "index.html": `<!DOCTYPE html>
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
</html>`,
    "style.css": `body {
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
}`,
    "script.js": `function updateClock() {
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
updateClock();`
};

// Функция для работы с Claude API
async function callClaudeAPI(prompt) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': process.env.CLAUDE_API_KEY
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                messages: [{ role: "user", content: prompt }],
                max_tokens_to_sample: 4000,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.content[0].text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API эндпоинты
app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log('Generating structure for:', description);

        if (description.toLowerCase().includes('час') || description.toLowerCase().includes('clock')) {
            return res.json({
                name: "digital-clock",
                files: clockTemplate
            });
        }

        const result = await callClaudeAPI(`Create a web application: ${description}. Return ONLY a JSON object with files content.`);
        res.json(JSON.parse(result));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/generate-code", async (req, res) => {
    try {
        const { description, structure } = req.body;
        console.log('Generating code for:', description);

        // Для часов возвращаем готовый шаблон
        if (description.toLowerCase().includes('час') || description.toLowerCase().includes('clock')) {
            return res.json(clockTemplate);
        }

        // Для других проектов используем Claude
        const result = await callClaudeAPI(`Generate code for: ${description}. Structure: ${JSON.stringify(structure)}`);
        res.json(JSON.parse(result));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>Project Generator</title>
    <style>
        body {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f0f0f0;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        textarea {
            width: 100%;
            height: 100px;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            overflow: auto;
            margin-top: 20px;
        }
        #error {
            color: red;
            margin: 10px 0;
            padding: 10px;
            background: #fff2f2;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Project Generator</h1>
        <textarea id="description" placeholder="Опишите проект (например: цифровые часы)"></textarea>
        <br>
        <button onclick="generate()">Сгенерировать проект</button>
        <div id="error"></div>
        <pre id="output"></pre>
    </div>

    <script>
        async function generate() {
            const description = document.getElementById('description').value;
            const error = document.getElementById('error');
            const output = document.getElementById('output');
            
            try {
                error.style.display = 'none';
                const response = await fetch('/api/generate-structure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description })
                });
                
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                
                output.textContent = JSON.stringify(data, null, 2);
                
                // Генерируем код
                const codeResponse = await fetch('/api/generate-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, structure: data })
                });
                
                const codeData = await codeResponse.json();
                if (codeData.error) throw new Error(codeData.error);
                
                output.textContent += '\n\nGenerated Code:\n' + JSON.stringify(codeData, null, 2);
            } catch (err) {
                error.textContent = 'Error: ' + err.message;
                error.style.display = 'block';
            }
        }
    </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key status:', process.env.CLAUDE_API_KEY ? 'Present' : 'Missing');
});