require('dotenv').config();
const express = require("express");
const markdown = require("markdown-it");
const fs = require("fs");
const path = require("path");
const ClaudeService = require("./services/claude");
const app = express();
const md = new markdown();

const claude = new ClaudeService(process.env.CLAUDE_API_KEY);

app.use(express.json());

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

// ... (остальной код server.js остается без изменений)
