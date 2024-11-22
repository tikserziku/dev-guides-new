const config = {
    production: {
        api: {
            url: 'https://api.anthropic.com/v1/messages',
            version: '2023-06-01',
            model: 'claude-3-opus-20240229',
            maxTokens: 4000,
            temperature: 0.7
        }
    },
    development: {
        api: {
            url: 'https://api.anthropic.com/v1/messages',
            version: '2023-06-01',
            model: 'claude-3-opus-20240229',
            maxTokens: 4000,
            temperature: 0.9 // Можно настроить разные параметры для dev
        }
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];