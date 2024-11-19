const fetch = require('node-fetch');

class ClaudeService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = process.env.CLAUDE_API_URL;
    }

    async generateProjectStructure(description) {
        const prompt = `
Based on the following project description, generate a detailed project structure with files and folders:

Description: ${description}

Consider our development patterns from https://dev-guides-docs-4670-b366ea1b6354.herokuapp.com/patterns

Generate the structure in JSON format including:
1. Folder structure
2. Required files
3. Brief description for each component
`;

        const response = await this.callClaude(prompt);
        return this.parseStructure(response);
    }

    async generateCode(structure) {
        const prompt = `
Generate code for the following project structure:

${JSON.stringify(structure, null, 2)}

Follow best practices from our guide and patterns.
Generate complete, working code for each file.
`;

        const response = await this.callClaude(prompt);
        return this.parseCode(response);
    }

    async callClaude(prompt) {
        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
            },
            body: JSON.stringify({
                prompt: prompt,
                model: "claude-3.5",
                max_tokens: 1000,
            }),
        });

        return await response.json();
    }

    parseStructure(response) {
        // Парсинг ответа Claude в структуру проекта
        try {
            return JSON.parse(response.completion);
        } catch (e) {
            console.error('Error parsing Claude response:', e);
            return {
                error: 'Failed to parse structure'
            };
        }
    }

    parseCode(response) {
        // Парсинг сгенерированного кода
        try {
            return JSON.parse(response.completion);
        } catch (e) {
            console.error('Error parsing code response:', e);
            return {
                error: 'Failed to parse code'
            };
        }
    }
}

module.exports = ClaudeService;
