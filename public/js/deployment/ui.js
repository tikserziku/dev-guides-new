class DeploymentUI {
    constructor() {
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('deployButton')?.addEventListener('click', () => this.handleDeploy());
    }

    async handleDeploy() {
        const deploymentStatus = document.getElementById('deploymentStatus');
        const projectData = this.gatherProjectData();

        try {
            deploymentStatus.textContent = 'Starting deployment...';
            
            const response = await fetch('/api/deployment/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ projectData })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showDeploymentSuccess(result);
            } else {
                this.showDeploymentError(result.error);
            }
        } catch (error) {
            this.showDeploymentError(error.message);
        }
    }

    gatherProjectData() {
        // Собираем данные из формы
        return {
            name: document.getElementById('projectName').value,
            type: document.getElementById('projectType').value,
            description: document.getElementById('projectDescription').value,
            mainFile: document.getElementById('mainFile').value || 'index.js',
            command: document.getElementById('startCommand').value || 'npm start',
            env: this.gatherEnvironmentVariables(),
            files: window.generatedFiles || {} // Получаем файлы из генератора кода
        };
    }

    gatherEnvironmentVariables() {
        const envVars = {};
        const envRows = document.querySelectorAll('.env-variable-row');
        
        envRows.forEach(row => {
            const key = row.querySelector('.env-key').value;
            const value = row.querySelector('.env-value').value;
            if (key && value) {
                envVars[key] = value;
            }
        });

        return envVars;