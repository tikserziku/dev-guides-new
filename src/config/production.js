module.exports = {
    api: {
        url: 'https://api.anthropic.com/v1/messages',
        version: '2023-06-01',
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature: 0.7
    },
    server: {
        port: process.env.PORT || 3000,
        env: 'production'
    },
    logging: {
        level: 'error',
        format: 'combined'
    }
};