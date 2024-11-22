# Полный код основных файлов проекта


## server.js

```javascript
﻿// Импорты и настройки
const express = require("express");
const path = require("path");
const fs = require("fs");
const marked = require("marked");
const fetch = require("node-fetch");
const createPageTemplate = require('./src/utils/template');

const app = express();
app.use(express.json());
app.use(express.static("public"));

const REQUIRED_FILES = ['README.md', 'README2.md', 'README3.md'];

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: ${file} not found at ${filePath}`);
    // Create empty file if it doesn't exist
    fs.writeFileSync(filePath, '# ' + file.replace('.md', ''));
  }
});

// Конфигурация
const config = {
    api: {
        url: 'https://api.anthropic.com/v1/messages',
        version: '2023-06-01',
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature: 0.7
    },
    port: process.env.PORT || 3000
};

// Обновим общие стили
const commonStyles = `
    body {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f5f5f5;
        line-height: 1.6;
    }
    .container {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .top-navigation {
        text-align: center;
        margin-bottom: 30px;
        padding: 15px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        position: sticky;
        top: 20px;
        z-index: 100;
    }
    .top-navigation a {
        margin: 0 20px;
        color: #0366d6;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    .top-navigation a:hover {
        background-color: #0366d6;
        color: white;
        transform: translateY(-1px);
    }
    .top-navigation a:active {
        transform: translateY(1px);
    }
    .markdown-body {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: white;
    }
    h1 {
        color: #2c3e50;
        font-size: 2.2em;
        margin-bottom: 30px;
        text-align: center;
    }
`;


// Утилиты
const readMarkdownFile = async (filename) => {
    try {
        const filePath = path.join(__dirname, filename);
        const content = await fs.promises.readFile(filePath, 'utf8');
        return marked.parse(content);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        throw new Error(`Error loading ${filename}`);
    }
};

// Claude API helper
async function callClaudeAPI(prompt) {
    try {
        const requestBody = {
            model: config.api.model,
            messages: [{
                role: "user",
                content: prompt
            }],
            max_tokens: config.api.maxTokens,
            temperature: config.api.temperature
        };

        console.log('API Request:', requestBody);

        const response = await fetch(config.api.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': config.api.version,
                'x-api-key': process.env.CLAUDE_API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API Error Response:', errorData);
            throw new Error(`API Error: ${errorData}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        return data.content[0].text;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// API Routes
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
        res.json(JSON.parse(result));
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Documentation Routes
app.get('/readme1', async (req, res) => {
    try {
        const content = await readMarkdownFile('README.md');
        res.send(createPageTemplate('Project Documentation', content));
    } catch (error) {
        console.error('Error reading README.md:', error);
        res.status(500).send('Error loading documentation. Please try again later.');
    }
});

app.get('/readme2', async (req, res) => {
    try {
        const content = await readMarkdownFile('README2.md');
        res.send(createPageTemplate('Development Guide', content));
    } catch (error) {
        console.error('Error reading README.md:', error);
        res.status(500).send('Error loading documentation. Please try again later.');
    }
});

app.get('/readme3', async (req, res) => {
    try {
        const content = await readMarkdownFile('README3.md');
        res.send(createPageTemplate('Project Examples', content));
    } catch (error) {
        console.error('Error reading README.md:', error);
        res.status(500).send('Error loading documentation. Please try again later.');
    }
});

// Home Page
app.get('/', (req, res) => {
    const homePageStyles = `
        textarea {
            width: 100%;
            height: 150px;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
            resize: vertical;
        }
        button {
            background: #0366d6;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        button:hover {
            background: #0256b9;
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
        #error {
            color: #dc3545;
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
            text-align: center;
        }
    `;

    const homeContent = `
        <h1>AI Project Generator</h1>
        <div>
            <label for="description">Project Description:</label>
            <textarea id="description" placeholder="Опишите ваш проект подробно..."></textarea>
        </div>
        <button onclick="generate()">Generate Structure</button>
        <div id="loading">Generating project...</div>
        <div id="error"></div>
        <div id="output"></div>

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
                    error.textContent = 'Error: ' + err.message;
                    error.style.display = 'block';
                } finally {
                    loading.style.display = 'none';
                }
            }
        </script>
    `;

    res.send(createPageTemplate('AI Project Generator', homeContent, homePageStyles));
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log('API Key status:', process.env.CLAUDE_API_KEY ? 'Present' : 'Missing');
});
```

### Описание:

- Основной файл сервера Express
- Обрабатывает HTTP запросы
- Отвечает за маршрутизацию
- Подключает статические файлы из директории public
- Интегрируется с API Claude


## services/claude.js

```javascript
﻿class ClaudeService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    async generateStructure(description) {
        console.log(`Analyzing project: ${description}`);
        try {
            const prompt = `Create a detailed project structure for this description: "${description}".
            The project should be well-organized and include all necessary files and folders.
            Return ONLY a JSON object with this structure:
            {
                "name": "project-name",
                "folders": [
                    {
                        "name": "folder-name",
                        "description": "folder purpose",
                        "files": [
                            {
                                "name": "filename.ext",
                                "description": "file purpose"
                            }
                        ]
                    }
                ]
            }`;

            const response = await this.makeRequest(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Structure generation error:', error);
            throw error;
        }
    }

    async generateCode(structure, description) {
        console.log(`Generating code for: ${description}`);
        try {
            const prompt = `Generate complete code for all files in this project: "${description}".
            Project structure: ${JSON.stringify(structure)}
            Return ONLY a JSON object where keys are file paths and values are complete file contents.
            Make the code fully functional and production-ready.`;

            const response = await this.makeRequest(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Code generation error:', error);
            throw error;
        }
    }

    async makeRequest(prompt) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-opus-20240229',
                    max_tokens: 4000,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Claude response:', data);
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error);
            throw error;
        }
    }
}

module.exports = ClaudeService;

```

### Описание:

- Сервис для работы с API Claude
- Отправляет запросы на генерацию структуры проекта
- Обрабатывает ответы от API
- Форматирует данные для фронтенда


## public/js/generator.js

```javascript
async function generate() {
    const description = document.getElementById('description').value;
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const output = document.getElementById('output');
    const button = document.querySelector('button');

    loading.style.display = 'block';
    error.style.display = 'none';
    output.innerHTML = '';
    button.disabled = true;
    button.style.opacity = '0.7';

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
        error.textContent = 'Error: ' + err.message;
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
        button.disabled = false;
        button.style.opacity = '1';
    }
}
```

### Описание:

- Клиентский JavaScript код
- Обрабатывает пользовательский ввод
- Отправляет AJAX запросы на сервер
- Отображает результаты генерации


## src/utils/template.js

```javascript
const createPageTemplate = (title, content, additionalStyles = '') => `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" rel="stylesheet">
    <style>
        ${commonStyles}
        ${additionalStyles}
    </style>
</head>
<body>
    <div class="top-navigation">
        <a href="/">Home</a>
        <span class="divider">|</span>
        <a href="/readme1">Overview</a>
        <span class="divider">|</span>
        <a href="/readme2">Development</a>
        <span class="divider">|</span>
        <a href="/readme3">Examples</a>
    </div>
    <div class="container markdown-body">
        ${content}
    </div>
</body>
</html>
`;

module.exports = createPageTemplate;
```

### Описание:

- Утилита для создания HTML шаблонов
- Генерирует разметку страницы
- Подставляет динамические данные


## src/config/index.js

```javascript
const config = {
    production: {
        api: {
            url: 'https://api.anthropic.com/v1/messages',
            version: '2023-06-01',
            model: 'claude-3-opus-20240229',
            maxTokens: 4000,
            temperature: 0.7
        }
    },
    development: {
        api: {
            url: 'https://api.anthropic.com/v1/messages',
            version: '2023-06-01',
            model: 'claude-3-opus-20240229',
            maxTokens: 4000,
            temperature: 0.9 // Можно настроить разные параметры для dev
        }
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];
```

### Описание:

- Конфигурационные файлы
- Настройки для разных окружений
- Параметры API и сервера


## src/config/development.js

```javascript
module.exports = {
    api: {
        url: 'https://api.anthropic.com/v1/messages',
        version: '2023-06-01',
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature: 0.9 // Higher temperature for development
    },
    server: {
        port: process.env.PORT || 3000,
        env: 'development'
    },
    logging: {
        level: 'debug',
        format: 'dev'
    }
};
```

### Описание:

- Конфигурационные файлы
- Настройки для разных окружений
- Параметры API и сервера


## src/config/production.js

```javascript
module.exports = {
    api: {
        url: 'https://api.anthropic.com/v1/messages',
        version: '2023-06-01',
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature: 0.7
    },
    server: {
        port: process.env.PORT || 3000,
        env: 'production'
    },
    logging: {
        level: 'error',
        format: 'combined'
    }
};
```

### Описание:

- Конфигурационные файлы
- Настройки для разных окружений
- Параметры API и сервера
