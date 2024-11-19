const express = require("express");
const markdown = require("markdown-it");
const fs = require("fs");
const app = express();
const md = new markdown();

app.get("/patterns", (req, res) => {
    const patterns = fs.readFileSync("patterns/ai_patterns.xml", "utf-8");
    res.header("Content-Type", "application/xml");
    res.send(patterns);
});

app.get("/", (req, res) => {
    const content = fs.readFileSync("README.md", "utf-8");
    const html = md.render(content);
    res.send(`<!DOCTYPE html><html><head><title>Development Guide</title>
    <style>body{max-width:800px;margin:0 auto;padding:20px;font-family:Arial}</style>
    </head><body>${html}<hr><p><a href="/patterns">View AI Patterns</a></p></body></html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
