const express = require("express");
const path = require("path");
const fetch = require('node-fetch');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Функция для работы с Claude API
async function callClaudeAPI(prompt) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01',
                'x-api-key': process.env.CLAUDE_API_KEY
            },
            body: JSON.stringify({
                model: "claude-3-opus-20240229",
                messages: [{ 
                    role: "user", 
                    content: `You are a code generator assistant. Follow these rules:
                    1. Generate complete, production-ready code
                    2. Include error handling and best practices
                    3. Add comments for complex parts
                    4. Follow modern coding standards
                    5. Ensure code is secure and maintainable
                    
                    Generate for this request: ${prompt}`
                }],
                max_tokens_to_sample: 4000,
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.content[0].text;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

app.post("/api/generate-structure", async (req, res) => {
    try {
        const { description } = req.body;
        console.log('Generating structure for:', description);

        const prompt = `Create a project structure for this description: ${description}
        Return a JSON object with this structure:
        {
            "name": "project-name",
            "type": "project-type",
            "structure": {
                "directories": [
                    {
                        "name": "directory-name",
                        "purpose": "directory-purpose",
                        "files": [
                            {
                                "name": "file-name",
                                "purpose": "file-purpose",
                                "technologies": ["tech1", "tech2"]
                            }
                        ]
                    }
                ],
                "dependencies": {
                    "required": ["dep1", "dep2"],
                    "optional": ["dep3", "dep4"]
                },
                "setup": {
                    "steps": ["step1", "step2"],
                    "configuration": {}
                }
            }
        }`;

        const result = await callClaudeAPI(prompt);
        res.json(JSON.parse(result));
    } catch (error) {
        console.error('Structure generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/generate-code", async (req, res) => {
    try {
        const { description, structure } = req.body;
        console.log('Generating code for:', description);

        const prompt = `Generate complete code for all files in this project.
        Project description: ${description}
        Project structure: ${JSON.stringify(structure)}
        
        Return a JSON object where:
        - Keys are file paths
        - Values are complete file contents
        
        Include:
        1. All necessary imports and dependencies
        2. Complete implementation with error handling
        3. Tests where appropriate
        4. Documentation and comments
        5. Configuration files
        
        Return only the JSON object with the code.`;

        const result = await callClaudeAPI(prompt);
        res.json(JSON.parse(result));
    } catch (error) {
        console.error('Code generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Главная страница с улучшенным UI
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html>
<head>
    <title>AI Project Generator</title>
    <style>
        body {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        textarea {
            width: 100%;
            height: 150px;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #45a049;
        }
        .output-container {
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .output-section {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        .file-header {
            background: #e9ecef;
            padding: 8px;
            margin: -15px -15px 15px;
            border-radius: 4px 4px 0 0;
            font-weight: bold;
        }
        pre {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        #error {
            color: red;
            padding: 10px;
            background: #fee;
            border-radius: 4px;
            margin: 10px 0;
            display: none;
        }
        #loading {
            display: none;
            color: #666;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI Project Generator</h1>
        <div>
            <label for="description">Опишите ваш проект подробно:</label>
            <textarea id="description" placeholder="Например: Веб-приложение для управления задачами с аутентификацией, базой данных MongoDB и REST API..."></textarea>
        </div>
        <button onclick="generate()">Сгенерировать проект</button>
        <div id="loading">Генерация проекта...</div>
        <div id="error"></div>
        <div class="output-container">
            <div class="output-section">
                <div class="file-header">Структура проекта</div>
                <pre id="structure"></pre>
            </div>
            <div class="output-section">
                <div class="file-header">Код проекта</div>
                <pre id="code"></pre>
            </div>
        </div>
    </div>

    <script>
    async function generate() {
        const description = document.getElementById('description').value;
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        const structure = document.getElementById('structure');
        const code = document.getElementById('code');

        loading.style.display = 'block';
        error.style.display = 'none';
        structure.textContent = '';
        code.textContent = '';

        try {
            // Генерация структуры
            const structureResponse = await fetch('/api/generate-structure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description })
            });

            const structureData = await structureResponse.json();
            if (structureData.error) throw new Error(structureData.error);
            
            structure.textContent = JSON.stringify(structureData, null, 2);

            // Генерация кода
            const codeResponse = await fetch('/api/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    description, 
                    structure: structureData 
                })
            });

            const codeData = await codeResponse.json();
            if (codeData.error) throw new Error(codeData.error);
            
            code.textContent = JSON.stringify(codeData, null, 2);
        } catch (err) {
            error.textContent = 'Ошибка: ' + err.message;
            error.style.display = 'block';
        } finally {
            loading.style.display = 'none';
        }
    }
    </script>
</body>
</html>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('API Key status:', process.env.CLAUDE_API_KEY ? 'Present' : 'Missing');
});