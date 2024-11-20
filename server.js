require('dotenv').config();
const express = require("express");
const markdown = require("markdown-it");
const fs = require("fs");
const path = require("path");
const xsltProcessor = require('xslt-processor');
const { xmlParse } = xsltProcessor;
const ClaudeService = require("./services/claude");

const app = express();
const md = new markdown();

const claude = new ClaudeService(process.env.CLAUDE_API_KEY);

app.use(express.json());
app.use(express.static('public'));

// API для генерации структуры
app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        const structure = await claude.generateProjectStructure(description);
        res.json(structure);
    } catch (error) {
        console.error('Error generating structure:', error);
        res.status(500).json({ error: 'Failed to generate structure' });
    }
});

// API для генерации кода
app.post("/api/generate-code", async (req, res) => {
    try {
        const { structure } = req.body;
        const code = await claude.generateCode(structure);
        res.json(code);
    } catch (error) {
        console.error('Error generating code:', error);
        res.status(500).json({ error: 'Failed to generate code' });
    }
});

// Основной маршрут
app.get("/", (req, res) => {
    const content = fs.readFileSync("README.md", "utf-8");
    const html = md.render(content);
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Development Guide</title>
            <style>
                body {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                }
                pre {
                    background-color: #f5f5f5;
                    padding: 10px;
                    border-radius: 5px;
                }
                code {
                    font-family: Consolas, monospace;
                }
            </style>
        </head>
        <body>
            ${html}
            <hr>
            <p><a href="/patterns">View AI Patterns</a> | <a href="/generator">Project Generator</a></p>
        </body>
        </html>
    `);
});

// Маршрут для отображения паттернов с использованием XSLT
app.get('/patterns', (req, res) => {
    try {
        // Чтение XML и XSL файлов
        const xmlFilePath = path.join(__dirname, 'patterns', 'ai_patterns.xml');
        const xslFilePath = path.join(__dirname, 'patterns', 'patterns.xsl');

        const xml = fs.readFileSync(xmlFilePath, 'utf-8');
        const xsl = fs.readFileSync(xslFilePath, 'utf-8');

        // Преобразование XML с использованием XSLT
        const xmlDoc = xmlParse(xml);
        const xslDoc = xmlParse(xsl);
        const result = xsltProcessor.xsltProcess(xmlDoc, xslDoc);

        // Отправка результата
        res.set('Content-Type', 'text/html');
        res.send(result);
    } catch (error) {
        console.error('Ошибка при обработке XML и XSL:', error);
        res.status(500).send('Ошибка при обработке паттернов');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
