class ClaudeService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    async generateStructure(description) {
        console.log(`Analyzing project: ${description}`);
        try {
            const prompt = `Create a detailed project structure for this description: "${description}".
            The project should be well-organized and include all necessary files and folders.
            Return ONLY a JSON object with this structure:
            {
                "name": "project-name",
                "folders": [
                    {
                        "name": "folder-name",
                        "description": "folder purpose",
                        "files": [
                            {
                                "name": "filename.ext",
                                "description": "file purpose"
                            }
                        ]
                    }
                ]
            }`;

            const response = await this.makeRequest(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Structure generation error:', error);
            throw error;
        }
    }

    async generateCode(structure, description) {
        console.log(`Generating code for: ${description}`);
        try {
            const prompt = `Generate complete code for all files in this project: "${description}".
            Project structure: ${JSON.stringify(structure)}
            Return ONLY a JSON object where keys are file paths and values are complete file contents.
            Make the code fully functional and production-ready.`;

            const response = await this.makeRequest(prompt);
            return JSON.parse(response);
        } catch (error) {
            console.error('Code generation error:', error);
            throw error;
        }
    }

    async makeRequest(prompt) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-opus-20240229',
                    max_tokens: 4000,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.5
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Claude response:', data);
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error);
            throw error;
        }
    }
}

module.exports = ClaudeService;
