# Path to the file
$filePath = "C:\Users\Drus\OneDrive\03_Projektavimas\Python\dev-guides-new\all_code.txt"

# Create content
$content = @"
# Code Snippets Collection

## Basic Scripts
```javascript
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));

// Generate project structure
app.post('/api/generate-structure', async (req, res) => {
    try {
        const { description } = req.body;
        const structure = await claude.generateStructure(description);
        res.json(structure);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate code
app.post('/api/generate-code', async (req, res) => {
    try {
        const { structure } = req.body;
        const code = await claude.generateCode(structure);
        res.json(code);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

## Usage Notes
- Node.js 16.x or later required
- Configure environment variables
- Use error handling patterns
- Validate all inputs
- Store API keys in .env file
"@

# Create file and write content
$content | Out-File -FilePath $filePath -Encoding UTF8

# Check if file was created
if (Test-Path $filePath) {
    Write-Host "File created successfully at: $filePath"
} else {
    Write-Host "Error creating file!"
}