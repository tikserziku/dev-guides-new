const express = require('express');
const router = express.Router();
const HerokuCLI = require('../services/heroku/cli');
const ProjectGenerator = require('../services/generator/project');
const tempManager = require('../utils/temp-manager');
const path = require('path');

router.post('/create', async (req, res) => {
    const { name, type, env } = req.body;
    
    try {
        const app = await HerokuCLI.createApp(name, { type, env });
        res.json({
            success: true,
            ...app
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.post('/deploy', async (req, res) => {
    const { projectData } = req.body;
    
    try {
        // Генерируем проект
        const { path: projectPath, files } = await ProjectGenerator.generateProject(projectData);
        
        // Создаем приложение на Heroku
        const app = await HerokuCLI.createApp(projectData.name, {
            type: projectData.type,
            env: projectData.env
        });
        
        // Деплоим проект
        const deployment = await HerokuCLI.deployProject(app.name, projectPath);
        
        // Очищаем временные файлы
        await tempManager.cleanupTempDir(projectPath);
        
        res.json({
            success: true,
            app,
            deployment,
            files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/status/:appName', async (req, res) => {
    try {
        const appInfo = await HerokuCLI.getAppInfo(req.params.appName);
        res.json({
            success: true,
            info: appInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;