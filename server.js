require('dotenv').config();
const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

app.post("/api/generate-structure", async (req, res) => {
   try {
       const { description } = req.body;
       console.log("Generating structure for:", description);

       const requestBody = {
           model: "claude-3-opus-20240229",
           messages: [{
               role: "user",
               content: `Create code for a web application: ${description}.
               Return only a JSON object with this exact structure:
               {
                   "name": "project-name",
                   "files": {
                       "index.html": "complete HTML code here",
                       "style.css": "complete CSS code here",
                       "script.js": "complete JavaScript code here"
                   }
               }`
           }],
           max_tokens: 4000,
           temperature: 0.7
       };

       console.log("Sending request to Claude API:", JSON.stringify(requestBody, null, 2));

       const response = await fetch('https://api.anthropic.com/v1/messages', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'x-api-key': CLAUDE_API_KEY,
               'anthropic-version': '2023-06-01'
           },
           body: JSON.stringify(requestBody)
       });

       console.log("API Response Status:", response.status);
       const responseText = await response.text();
       console.log("Raw API Response:", responseText);

       try {
           const data = JSON.parse(responseText);
           console.log("Parsed API Response:", JSON.stringify(data, null, 2));

           if (data.error) {
               throw new Error(data.error.message);
           }

           // Extract the actual content from Claude's response
           const content = data.content[0].text;
           console.log("Claude content:", content);

           // Parse the project structure JSON from Claude's response
           const projectStructure = JSON.parse(content);
           res.json(projectStructure);

       } catch (parseError) {
           console.error("Parse error:", parseError);
           res.status(500).json({
               error: 'Failed to parse response',
               details: responseText
           });
       }
   } catch (error) {
       console.error("Request error:", error);
       res.status(500).json({ error: error.message });
   }
});

app.post("/api/generate-code", async (req, res) => {
   try {
       const { description, structure } = req.body;
       console.log("Generating code for:", description);

       const requestBody = {
           model: "claude-3-opus-20240229",
           messages: [{
               role: "user",
               content: `Generate complete code for a web application: ${description}. 
               Project structure: ${JSON.stringify(structure)}
               Return only a JSON object where keys are file paths and values are complete code contents.`
           }],
           max_tokens: 4000,
           temperature: 0.7
       };

       console.log("Sending code generation request:", JSON.stringify(requestBody, null, 2));

       const response = await fetch('https://api.anthropic.com/v1/messages', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'x-api-key': CLAUDE_API_KEY,
               'anthropic-version': '2023-06-01'
           },
           body: JSON.stringify(requestBody)
       });

       console.log("API Response Status:", response.status);
       const responseText = await response.text();
       console.log("Raw API Response:", responseText);

       try {
           const data = JSON.parse(responseText);
           console.log("Parsed API Response:", JSON.stringify(data, null, 2));

           if (data.error) {
               throw new Error(data.error.message);
           }

           const content = data.content[0].text;
           console.log("Claude content:", content);

           const generatedCode = JSON.parse(content);
           res.json(generatedCode);

       } catch (parseError) {
           console.error("Parse error:", parseError);
           res.status(500).json({
               error: 'Failed to parse code response',
               details: responseText
           });
       }
   } catch (error) {
       console.error("Code generation error:", error);
       res.status(500).json({ error: error.message });
   }
});

app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
   console.log('API Key status:', CLAUDE_API_KEY ? 'Present' : 'Missing');
   console.log('API Key format check:', CLAUDE_API_KEY?.startsWith('sk-ant-api'));
});