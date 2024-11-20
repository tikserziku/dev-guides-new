class ClaudeService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async generateProjectStructure(description) {
        // Mock response for test mode
        return {
            name: "sample-project",
            folders: [
                {
                    name: "src",
                    files: ["index.js", "styles.css"]
                }
            ]
        };
    }

    async generateCode(structure) {
        // Mock response for test mode
        return {
            "index.js": "console.log(\'Hello World\')",
            "styles.css": "body { margin: 0; }"
        };
    }
}

module.exports = ClaudeService;
