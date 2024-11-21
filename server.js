const express = require("express");
const path = require("path");
const fs = require("fs");
const marked = require("marked");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

[стальной код server.js]

// лавная страница
app.get("/", (req, res) => {
    ${mainPageContent}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("API Key status:", process.env.CLAUDE_API_KEY ? "Present" : "Missing");
});
