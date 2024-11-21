﻿require('dotenv').config();
const express = require("express");
const markdown = require("markdown-it");
const fs = require("fs");
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

// Новый маршрут для отображения паттернов в формате HTML
app.get('/patterns', (req, res) => {
    try {
        // Здесь можно хранить паттерны как объект в формате JSON
        const patterns = [
            {
                id: "file_manipulation",
                description: "Паттерн для работы с файлами в PowerShell",
                reference: "Section 2.1 in guide"
            },
            {
                id: "api_interaction",
                description: "Паттерн для взаимодействия с API через PowerShell",
                reference: "Section 3.4 in guide"
            }
        ];
        
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>AI Patterns</title>
                <style>
                    body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table, th, td {
                        border: 1px solid black;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <h1>AI Patterns</h1>
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Description</th>
                        <th>Reference</th>
                    </tr>
        `;
        
        patterns.forEach(pattern => {
            htmlContent += `
                <tr>
                    <td>${pattern.id}</td>
                    <td>${pattern.description}</td>
                    <td>${pattern.reference}</td>
                </tr>
            `;
        });
        
        htmlContent += `
                </table>
            </body>
            </html>
        `;

        res.send(htmlContent);
    } catch (error) {
        console.error('Ошибка при получении паттернов:', error);
        res.status(500).send('Ошибка при получении паттернов');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
