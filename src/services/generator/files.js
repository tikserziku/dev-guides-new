const fs = require('fs').promises;
const path = require('path');
const tempManager = require('../../utils/temp-manager');

class ProjectGenerator {
    async generateProject(projectData) {
        const projectDir = await tempManager.createTempDir();
        
        try {
            // Генерируем основные файлы проекта
            await this.generatePackageJson(projectData, projectDir);
            await this.generateProcfile(projectData, projectDir);
            
            // Генерируем файлы проекта из структуры
            if (projectData.files) {
                await this.generateProjectFiles(projectData.files, projectDir);
            }

            return {
                path: projectDir,
                files: await this.getGeneratedFilesList(projectDir)
            };
        } catch (error) {
            await tempManager.cleanupTempDir(projectDir);
            throw error;
        }
    }

    async generatePackageJson(projectData, targetDir) {
        const packageJson = {
            name: projectData.name.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            description: projectData.description || '',
            main: projectData.mainFile || 'index.js',
            scripts: {
                start: `node ${projectData.mainFile || 'index.js'}`,
                test: 'echo "Error: no test specified" && exit 1'
            },
            keywords: [],
            author: '',
            license: 'ISC',
            dependencies: projectData.dependencies || {},
            engines: {
                node: '>=14.0.0'
            }
        };

        await fs.writeFile(
            path.join(targetDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
    }

    async generateProcfile(projectData, targetDir) {
        const command = projectData.command || `npm start`;
        await fs.writeFile(
            path.join(targetDir, 'Procfile'),
            `web: ${command}`
        );
    }

    async generateProjectFiles(files, targetDir) {
        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(targetDir, filePath);
            const dirName = path.dirname(fullPath);
            
            await fs.mkdir(dirName, { recursive: true });
            await fs.writeFile(fullPath, content);
        }
    }

    async getGeneratedFilesList(dir) {
        const files = [];
        
        async function scan(directory) {
            const entries = await fs.readdir(directory, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(directory, entry.name);
                if (entry.isDirectory()) {
                    await scan(fullPath);
                } else {
                    files.push(path.relative(dir, fullPath));
                }
            }
        }
        
        await scan(dir);
        return files;
    }
}

module.exports = new ProjectGenerator();