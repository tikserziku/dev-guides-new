module.exports = {
    api: {
        key: process.env.HEROKU_API_KEY,
        email: process.env.HEROKU_EMAIL,
        region: process.env.HEROKU_REGION || 'eu',
        stack: process.env.HEROKU_STACK || 'heroku-22'
    },
    // Базовые настройки для всех проектов
    defaults: {
        region: 'eu',
        stack: 'heroku-22',
        buildpacks: ['heroku/nodejs'],
        env: {
            NODE_ENV: 'production'
        }
    },

    // Типы проектов и их специфические настройки
    projectTypes: {
        'node-static': {
            buildpacks: ['heroku/nodejs', 'heroku/static'],
            env: {
                NPM_CONFIG_PRODUCTION: 'true'
            }
        },
        'node-server': {
            buildpacks: ['heroku/nodejs'],
            env: {
                NPM_CONFIG_PRODUCTION: 'true'
            }
        },
        'react-app': {
            buildpacks: ['heroku/nodejs', 'mars/create-react-app'],
            env: {
                GENERATE_SOURCEMAP: 'false'
            }
        }
    },

    // Таймауты для различных операций
    timeouts: {
        create: 30000,    // 30 секунд на создание приложения
        deploy: 300000,   // 5 минут на деплой
        configure: 60000  // 1 минута на конфигурацию
    },

    // Настройки временных директорий
    temp: {
        maxAge: 3600000, // 1 час
        cleanupInterval: 900000 // 15 минут
    },

    // Настройки логирования
    logging: {
        deployments: true,
        commands: true,
        cleanup: true
    }
};