class ClaudeService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
    }

    async generateStructure(description) {
        const prompt = `As an expert software architect, analyze this project description and create a detailed project structure. 
        Project description: "${description}"
        
        Please provide:
        1. A complete directory and file structure
        2. Brief description of each file's purpose
        3. List of required dependencies
        4. Architecture overview`;

        const response = await this.makeRequest(prompt);
        return JSON.parse(response);
    }

    async generateCode(structure, description) {
        const prompt = `As an expert developer, generate complete code for all files in this project structure.
        Project description: "${description}"
        Project structure: ${JSON.stringify(structure)}`;

        const response = await this.makeRequest(prompt);
        return JSON.parse(response);
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
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            console.error('Claude API error:', error);
            throw error;
        }
    }
}

module.exports = ClaudeService;
