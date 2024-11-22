const express = require("express");
const path = require("path");
const fs = require("fs");
const marked = require("marked");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Функция для работы с Claude API
async function callClaudeAPI(prompt) {
    try {
        const requestBody = {
            model: "claude-3-opus-20240229",
            messages: [{
                role: "user",
                content: prompt
            }],
            max_tokens: 4000,
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

// API маршруты
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

// README маршруты
app.get('/readme1', (req, res) => {
    const readmePath = path.join(__dirname, 'README.md');
    fs.readFile(readmePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading README');
            return;
        }
        const markdownHtml = marked.parse(data);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Project Documentation</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" rel="stylesheet">
                <style>
                    .markdown-body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: white;
                    }
                    body { background: #f5f5f5; }
                    .nav { text-align: center; margin: 20px 0; }
                    .nav a { 
                        margin: 0 10px;
                        color: #0366d6;
                        text-decoration: none;
                    }
                    .nav a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="nav">
                    <a href="/">Home</a> |
                    <a href="/readme1">Overview</a> |
                    <a href="/readme2">Development</a> |
                    <a href="/readme3">Examples</a>
                </div>
                <div class="markdown-body">${markdownHtml}</div>
            </body>
            </html>
        `);
    });
});

app.get('/readme2', (req, res) => {
    const readmePath = path.join(__dirname, 'README2.md');
    fs.readFile(readmePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading README2');
            return;
        }
        const markdownHtml = marked.parse(data);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Development Guide</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" rel="stylesheet">
                <style>
                    .markdown-body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: white;
                    }
                    body { background: #f5f5f5; }
                    .nav { text-align: center; margin: 20px 0; }
                    .nav a { 
                        margin: 0 10px;
                        color: #0366d6;
                        text-decoration: none;
                    }
                    .nav a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="nav">
                    <a href="/">Home</a> |
                    <a href="/readme1">Overview</a> |
                    <a href="/readme2">Development</a> |
                    <a href="/readme3">Examples</a>
                </div>
                <div class="markdown-body">${markdownHtml}</div>
            </body>
            </html>
        `);
    });
});

app.get('/readme3', (req, res) => {
    const readmePath = path.join(__dirname, 'README3.md');
    fs.readFile(readmePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error loading README3');
            return;
        }
        const markdownHtml = marked.parse(data);
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Project Examples</title>
                <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" rel="stylesheet">
                <style>
                    .markdown-body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        background: white;
                    }
                    body { background: #f5f5f5; }
                    .nav { text-align: center; margin: 20px 0; }
                    .nav a { 
                        margin: 0 10px;
                        color: #0366d6;
                        text-decoration: none;
                    }
                    .nav a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="nav">
                    <a href="/">Home</a> |
                    <a href="/readme1">Overview</a> |
                    <a href="/readme2">Development</a> |
                    <a href="/readme3">Examples</a>
                </div>
                <div class="markdown-body">${markdownHtml}</div>
            </body>
            </html>
        `);
    });
});

// Главная страница
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>AI Project Generator</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
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
        .nav-links {
            text-align: center;
            margin-bottom: 20px;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .nav-links a {
            margin: 0 10px;
            color: #0366d6;
            text-decoration: none;
            padding: 5px 10px;
        }
        .nav-links a:hover {
            background: #f0f0f0;
            border-radius: 4px;
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
        button:hover {
            background: #45a049;
        }
        #output {
            margin-top: 20px;
        }
        .code-section {
            margin-top: 20px;
            background: #2d2d2d;
            padding: 15px;
            border-radius: 4px;
            color: #fff;
        }
        .code-header {
            background: #1e1e1e;
            padding: 8px 15px;
            margin: -15px -15px 15px;
            border-radius: 4px 4px 0 0;
            font-family: monospace;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
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
        .footer-nav {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        .footer-nav a {
            margin: 0 10px;
            color: #0366d6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Верхняя навигация -->
        <div class="nav-links">
            <a href="/">Home</a> |
            <a href="/readme1">Overview</a> |
            <a href="/readme2">Development</a> |
            <a href="/readme3">Examples</a>
        </div>

        <h1>AI Project Generator</h1>
        <textarea id="description" placeholder="Опишите ваш проект..."></textarea>
        <button onclick="generate()">Сгенерировать проект</button>
        <div id="loading">Генерация проекта...</div>
        <div id="error"></div>
        <div id="output"></div>

        <!-- Нижняя навигация -->
        <div class="footer-nav">
            <a href="/">Home</a> |
            <a href="/readme1">Documentation 1</a> |
            <a href="/readme2">Documentation 2</a>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
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
                const structureResponse = await fetch('/api/generate-structure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description })
                });

                const structureData = await structureResponse.json();
                if (structureData.error) throw new Error(structureData.error);

                output.innerHTML = "<div class='code-section'>";
                output.innerHTML += "<div class='code-header'>Project Structure</div>";
                output.innerHTML += "<pre><code class='language-json'>" + 
                    JSON.stringify(structureData, null, 2) + "</code></pre>";
                output.innerHTML += "</div>";

                const codeResponse = await fetch('/api/generate-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, structure: structureData })
                });

                const codeData = await codeResponse.json();
                if (codeData.error) throw new Error(codeData.error);

                Object.entries(codeData).forEach(([filename, content]) => {
                    output.innerHTML += "<div class='code-section'>";
                    output.innerHTML += "<div class='code-header'>" + filename + "</div>";
                    output.innerHTML += "<pre><code>" + content + "</code></pre>";
                    output.innerHTML += "</div>";
                });

                Prism.highlightAll();
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

// Обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key status:', process.env.CLAUDE_API_KEY ? 'Present' : 'Missing');
});