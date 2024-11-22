module.exports = {
    api: {
        url: 'https://api.anthropic.com/v1/messages',
        version: '2023-06-01',
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature: 0.9 // Higher temperature for development
    },
    server: {
        port: process.env.PORT || 3000,
        env: 'development'
    },
    logging: {
        level: 'debug',
        format: 'dev'
    }
};