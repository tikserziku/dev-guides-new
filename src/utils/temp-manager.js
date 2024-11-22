const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TempManager {
    constructor() {
        this.baseDir = path.join(__dirname, '../../temp');
    }

    async createTempDir() {
        const dirId = uuidv4();
        const tempPath = path.join(this.baseDir, dirId);
        await fs.mkdir(tempPath, { recursive: true });
        return tempPath;
    }

    async cleanupTempDir(dirPath) {
        try {
            await fs.rm(dirPath, { recursive: true, force: true });
        } catch (error) {
            console.error(`Error cleaning temp directory ${dirPath}:`, error);
        }
    }

    async initializeTempDirs() {
        // Создаем базовую директорию при старте
        await fs.mkdir(this.baseDir, { recursive: true });
        
        // Очищаем старые временные директории
        const contents = await fs.readdir(this.baseDir);
        const cleanupPromises = contents.map(item => 
            this.cleanupTempDir(path.join(this.baseDir, item))
        );
        await Promise.all(cleanupPromises);
    }
}

module.exports = new TempManager();