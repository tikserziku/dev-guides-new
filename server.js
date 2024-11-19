const express = require("express");
const markdown = require("markdown-it");
const fs = require("fs");
const app = express();
const md = new markdown();

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
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
