const express = require("express");
const path = require("path");
const fs = require("fs");
const marked = require("marked");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Function to handle Claude API calls
async function callClaudeAPI(prompt) {
  try {
    const requestBody = {
      model: "claude-3-opus-20240229", // Or the most recent Claude model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000,
      temperature: 0.7,
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.CLAUDE_API_KEY, // Crucial: MUST set this environment variable
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Response Error:", errorData);
      throw new Error(`API Error: ${errorData}`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message);
    }
    return data.content[0]?.text; // Added optional chaining
  } catch (error) {
    console.error("API Error:", error);
    throw error; // Re-throw the error for the calling function to handle
  }
}



// API route for generating project structure
app.post("/api/generate-structure", async (req, res) => {
  try {
    const { description } = req.body;
    const prompt = `Create a project structure for this description: ${description} \n\nReturn ONLY a JSON object with this structure: \n```json
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
}
````;
    const result = await callClaudeAPI(prompt);
    const parsedResult = JSON.parse(result); // Added error handling
    res.json(parsedResult);
  } catch (error) {
    console.error("Structure generation error:", error);
    res.status(500).json({ error: error.message });
  }
});


// API route for generating code
app.post("/api/generate-code", async (req, res) => {
  try {
    const { description, structure } = req.body;
    const prompt = `Generate code for this project description: ${description} \nProject structure: ${JSON.stringify(structure)} \nReturn ONLY a JSON object where keys are file paths and values are complete file contents.`;
    const result = await callClaudeAPI(prompt);
    const parsedResult = JSON.parse(result);
    res.json(parsedResult);
  } catch (error) {
    console.error("Code generation error:", error);
    res.status(500).json({ error: error.message });
  }
});



// README routes (No changes needed)

// ... (your README routes remain the same)

// Main page route
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>AI Project Generator</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
  <style>
   /* ... your CSS styles ... */
  </style>
</head>
<body>
  <div class="container">
  </div>
  <h1>AI Project Generator</h1>
  <textarea id="description" placeholder="Enter your project description..."></textarea>
  <button onclick="generate()">Generate Project</button>
  <div id="loading">Generating project...</div>
  <div id="error"></div>
  <div id="output"></div>
</body>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
<script>
   async function generate() {
       // ... (your existing JavaScript code)
   }
</script>
</html>`);
});

// Error handler - crucial for production
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log("API key status:", process.env.CLAUDE_API_KEY ? "Present" : "Missing");
});