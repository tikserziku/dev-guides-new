require('dotenv').config();
const express = require("express");
const path = require("path");
const ClaudeService = require("./services/claude");

const app = express();
app.use(express.json());
app.use(express.static('public'));

const claude = new ClaudeService(process.env.CLAUDE_API_KEY);

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            throw new Error("Description is required");
        }
        const structure = await claude.generateStructure(description);
        res.json(structure);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/generate-code", async (req, res) => {
    try {
        const { structure, description } = req.body;
        if (!structure) {
            throw new Error("Structure is required");
        }
        const code = await claude.generateCode(structure, description);
        res.json(code);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
