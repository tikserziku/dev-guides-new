﻿// Импорты
const express = require("express");
const path = require("path");
const fs = require("fs");
const marked = require("marked");
const fetch = require("node-fetch");
const { createPageTemplate, commonStyles } = require('./src/utils/template');
const homePageStyles = require('./src/styles/home');
const homeContent = require('./src/templates/home');
const deploymentForm = require('./src/templates/deployment-form');

// Инициализация приложения
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Проверка и создание необходимых файлов
const REQUIRED_FILES = ['README.md', 'README2.md', 'README3.md'];

REQUIRED_FILES.forEach(file => {
 const filePath = path.join(__dirname, file);
 if (!fs.existsSync(filePath)) {
   console.warn(`Warning: ${file} not found at ${filePath}`);
   fs.writeFileSync(filePath, '# ' + file.replace('.md', ''));
 }
});

// Маршрут для страницы деплоя
app.get('/deploy', (req, res) => {
   res.send(createPageTemplate('Deploy Project', deploymentForm));
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

// В server.js добавьте:
app.post('/api/deployment/deploy', async (req, res) => {
    try {
        const projectData = req.body;
        
        // Создаем временную директорию для проекта
        const projectDir = path.join(__dirname, 'temp', `${projectData.name}-${Date.now()}`);
        await fs.promises.mkdir(projectDir, { recursive: true });
        
        // Генерируем файлы проекта
        for (const [filename, content] of Object.entries(projectData.files)) {
            await fs.promises.writeFile(
                path.join(projectDir, filename),
                content
            );
        }

        // Создаем новое приложение на Heroku
        const herokuAppName = `${projectData.name}-${Date.now()}`;
        const appUrl = await createHerokuApp(herokuAppName, projectDir);
        
        res.json({
            success: true,
            url: appUrl
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


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
        const status = error.message.includes('timed out') ? 503 : 500;
        res.status(status).json({ error: error.message });
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
        // Экранируем HTML перед парсингом JSON
        const sanitizedResult = result.replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
        res.json(JSON.parse(sanitizedResult));
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

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

        const fetchPromise = fetch(config.api.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': config.api.version,
                'x-api-key': process.env.CLAUDE_API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request took too long')), 45000);
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

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
        if (error.message === 'Request took too long') {
            throw new Error('Request timed out. Please try again.');
        }
        throw error;
    }
}


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
        console.error('Error reading README2.md:', error);
        res.status(500).send('Error loading documentation. Please try again later.');
    }
});

app.get('/readme3', async (req, res) => {
    try {
        const content = await readMarkdownFile('README3.md');
        res.send(createPageTemplate('Project Examples', content));
    } catch (error) {
        console.error('Error reading README3.md:', error);
        res.status(500).send('Error loading documentation. Please try again later.');
    }
});

// Home Page
app.get('/', (req, res) => {
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