require('dotenv').config();
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

// Новый API для подтверждения структуры пользователем
app.post("/api/confirm-structure", async (req, res) => {
    try {
        const { structure, feedback } = req.body;
        if (feedback && feedback.length > 0) {
            // Обработка обратной связи
            const updatedStructure = await claude.updateProjectStructure(structure, feedback);
            res.json({ updatedStructure, message: 'Structure updated based on feedback' });
        } else {
            res.json({ message: 'Structure confirmed' });
        }
    } catch (error) {
        console.error('Error confirming structure:', error);
        res.status(500).json({ error: 'Failed to confirm structure' });
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

// Новый маршрут для генератора проекта
app.get('/generator', (req, res) => {
    try {
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Project Generator</title>
                <style>
                    body {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        font-family: Arial, sans-serif;
                    }
                    textarea {
                        width: 100%;
                        height: 100px;
                    }
                    button {
                        padding: 10px;
                        font-size: 16px;
                    }
                    pre {
                        background-color: #f5f5f5;
                        padding: 10px;
                        border-radius: 5px;
                        overflow: auto;
                    }
                </style>
            </head>
            <body>
                <h1>Project Generator</h1>
                <form id="generateForm">
                    <label for="description">Project Description:</label><br>
                    <textarea id="description" name="description"></textarea><br><br>
                    <button type="button" onclick="generateProject()">Generate Project</button>
                </form>
                <h2>Generated Project Structure</h2>
                <pre id="output"></pre>
                <script>
                    async function generateProject() {
                        const description = document.getElementById('description').value;
                        const response = await fetch('/api/generate-structure', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ description })
                        });
                        const data = await response.json();
                        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
                    }
                </script>
            </body>
            </html>
        `;

        res.send(htmlContent);
    } catch (error) {
        console.error('Ошибка при открытии генератора проекта:', error);
        res.status(500).send('Ошибка при открытии генератора проекта');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
