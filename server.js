const express = require("express");
const markdown = require("markdown-it");
const fs = require("fs");
const path = require("path");
const app = express();
const md = new markdown();

app.use(express.json());

// Существующие маршруты
app.get("/patterns", (req, res) => {
    const patterns = fs.readFileSync("patterns/ai_patterns.xml", "utf-8");
    res.header("Content-Type", "application/xml");
    res.send(patterns);
});

// Новый маршрут для генератора проектов
app.get("/generator", (req, res) => {
    const generatorHtml = fs.readFileSync("project-generator/index.html", "utf-8");
    res.send(generatorHtml);
});

// API для генерации структуры
app.post("/api/generate-structure", async (req, res) => {
    const { description } = req.body;
    // Здесь будет интеграция с Claude API
    const structure = {
        name: "generated-project",
        folders: [
            {
                name: "src",
                files: ["index.js", "app.js"]
            },
            {
                name: "docs",
                files: ["README.md"]
            }
        ]
    };
    res.json(structure);
});

// API для генерации кода
app.post("/api/generate-code", async (req, res) => {
    // Здесь будет генерация кода через Claude API
    res.json({ status: "success" });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));

// ... (остальной код server.js остается без изменений)
