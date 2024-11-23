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

    // Добавьте в функцию generate() после Prism.highlightAll();
    output.innerHTML += `
    <div class="deploy-section">
        <button class="heroku-deploy-btn" onclick="deployToHeroku()">
            Deploy to Heroku
        </button>
    </div>
    `;



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

    async function deployToHeroku(projectData) {
        const status = document.getElementById('deploymentStatus');
        try {
            status.innerHTML = 'Deploying to Heroku...';
            const response = await fetch('/api/deployment/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });
            
            const result = await response.json();
            if (result.success) {
                status.innerHTML = `Deployed successfully: <a href="${result.url}" target="_blank">${result.url}</a>`;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            status.innerHTML = `Deployment failed: ${error.message}`;
        }
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