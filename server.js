const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Функция для работы с Claude API
async function callClaudeAPI(prompt) {
    try {
        const requestBody = {
            model: "claude-3-opus-20240229",
            messages: [{
                role: "user",
                content: prompt
            }],
            max_tokens: 4000,  // Изменено с max_tokens_to_sample на max_tokens
            temperature: 0.7
        };

        console.log('Sending request to API:', requestBody);

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': process.env.CLAUDE_API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Response Error:', errorData);
            throw new Error(`API Error: ${errorData}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data.error) {
            throw new Error(data.error.message);
        }

        return data.content[0].text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// API для генерации структуры проекта
app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log('Generating structure for:', description);

        const prompt = `Create a project structure for this description: ${description}
        Return ONLY a JSON object with this structure:
        {
            "name": "project-name",
            "type": "type of project",
            "files": {
                "file-path": {
                    "content": "file content here",
                    "description": "file purpose",
                    "technologies": ["tech1", "tech2"]
                }
            },
            "dependencies": {
                "required": ["dep1", "dep2"]
            }
        }`;

        const result = await callClaudeAPI(prompt);
        console.log('Generated structure:', result);
        res.json(JSON.parse(result));
    } catch (error) {
        console.error('Structure generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// API для генерации кода
app.post("/api/generate-code", async (req, res) => {
    try {
        const { description, structure } = req.body;
        console.log('Generating code for:', description);

        const prompt = `Generate code for this project description: ${description}
        Project structure: ${JSON.stringify(structure)}
        Return ONLY a JSON object where keys are file paths and values are complete file contents.`;

        const result = await callClaudeAPI(prompt);
        console.log('Generated code:', result);
        res.json(JSON.parse(result));
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>AI Project Generator</title>
    <style>
        body {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        textarea {
            width: 100%;
            height: 150px;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .output-section {
            margin-top: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            background: #fff;
            padding: 10px;
            border-radius: 4px;
        }
        #error {
            color: red;
            padding: 10px;
            background: #fee;
            border-radius: 4px;
            margin: 10px 0;
            display: none;
        }
        #loading {
            display: none;
            color: #666;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Project Generator</h1>
        <textarea id="description" placeholder="Опишите ваш проект..."></textarea>
        <button onclick="generate()">Сгенерировать проект</button>
        <div id="loading">Генерация проекта...</div>
        <div id="error"></div>
        <div id="output" class="output-section"></div>
    </div>

    <script>
    async function generate() {
        const description = document.getElementById('description').value;
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const output = document.getElementById('output');

        loading.style.display = 'block';
        error.style.display = 'none';
        output.innerHTML = '';

        try {
            // Генерация структуры
            const structureResponse = await fetch('/api/generate-structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });

            const structureData = await structureResponse.json();
            if (structureData.error) throw new Error(structureData.error);

            output.innerHTML = '<h3>Project Structure:</h3>';
            output.innerHTML += '<pre>' + JSON.stringify(structureData, null, 2) + '</pre>';

            // Генерация кода
            const codeResponse = await fetch('/api/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, structure: structureData })
            });

            const codeData = await codeResponse.json();
            if (codeData.error) throw new Error(codeData.error);

            output.innerHTML += '<h3>Generated Code:</h3>';
            output.innerHTML += '<pre>' + JSON.stringify(codeData, null, 2) + '</pre>';
        } catch (err) {
            error.textContent = 'Ошибка: ' + err.message;
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
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