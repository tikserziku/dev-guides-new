const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const config = require('../../utils/heroku-config');
const path = require('path');
const fs = require('fs').promises;

class HerokuCLIService {
    constructor() {
        this.verifyHerokuCLI();
    }

    async verifyHerokuCLI() {
        try {
            await execAsync('heroku --version');
        } catch (error) {
            throw new Error('Heroku CLI not found. Please install Heroku CLI first.');
        }
    }

    async createApp(name, options = {}) {
        const projectType = options.type || 'node-server';
        const projectConfig = {
            ...config.defaults,
            ...config.projectTypes[projectType]
        };

        try {
            // Создаем приложение
            const { stdout: createOutput } = await execAsync(
                `heroku create ${name} --region ${projectConfig.region}`
            );

            // Устанавливаем buildpacks
            for (const buildpack of projectConfig.buildpacks) {
                await execAsync(`heroku buildpacks:add ${buildpack} -a ${name}`);
            }

            // Устанавливаем переменные окружения
            const envVars = {
                ...projectConfig.env,
                ...options.env
            };
            
            const envString = Object.entries(envVars)
                .map(([key, value]) => `${key}=${value}`)
                .join(' ');
            
            if (envString) {
                await execAsync(`heroku config:set ${envString} -a ${name}`);
            }

            return {
                name,
                url: this.extractAppUrl(createOutput),
                config: projectConfig
            };
        } catch (error) {
            throw new Error(`Failed to create Heroku app: ${error.message}`);
        }
    }

    async deployProject(appName, projectPath) {
        try {
            // Инициализируем Git если нужно
            try {
                await execAsync('git rev-parse --git-dir', { cwd: projectPath });
            } catch {
                await execAsync('git init', { cwd: projectPath });
            }

            // Настраиваем remote
            await execAsync(
                `git remote add heroku https://git.heroku.com/${appName}.git`,
                { cwd: projectPath }
            );

            // Коммитим изменения
            await execAsync('git add .', { cwd: projectPath });
            await execAsync(
                'git commit -m "Initial deployment"',
                { cwd: projectPath }
            );

            // Пушим на Heroku
            const { stdout, stderr } = await execAsync(
                'git push heroku master --force',
                { cwd: projectPath }
            );

            return {
                success: true,
                output: stdout,
                error: stderr
            };
        } catch (error) {
            throw new Error(`Deployment failed: ${error.message}`);
        }
    }

    extractAppUrl(output) {
        const urlMatch = output.match(/https:\/\/[-.a-z0-9]+\.herokuapp\.com/i);
        return urlMatch ? urlMatch[0] : null;
    }

    async getAppInfo(appName) {
        try {
            const { stdout } = await execAsync(`heroku apps:info -a ${appName} --json`);
            return JSON.parse(stdout);
        } catch (error) {
            throw new Error(`Failed to get app info: ${error.message}`);
        }
    }
}

module.exports = new HerokuCLIService();