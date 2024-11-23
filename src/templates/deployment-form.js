const deploymentForm = `
<div class="deployment-container">
    <h2>Deploy Generated Project</h2>
    <form id="deploymentForm" class="deployment-form">
        <div class="form-group">
            <label for="projectName">Project Name</label>
            <input type="text" id="projectName" required 
                   pattern="[a-z0-9-]+" 
                   title="Only lowercase letters, numbers, and hyphens allowed"
                   placeholder="my-project-name">
        </div>

        <div class="form-group">
            <label for="projectType">Project Type</label>
            <select id="projectType" required>
                <option value="node-server">Node.js Server</option>
                <option value="node-static">Static Site</option>
                <option value="react-app">React App</option>
            </select>
        </div>

        <div class="form-group">
            <label>Environment Variables</label>
            <div id="envVariables" class="env-variables">
                <div class="env-row">
                    <input type="text" class="env-key" 
                           placeholder="KEY" 
                           pattern="[A-Z0-9_]+" 
                           title="Uppercase letters, numbers and underscore only">
                    <input type="text" class="env-value" 
                           placeholder="VALUE">
                    <button type="button" class="remove-env" 
                            title="Remove variable">×</button>
                </div>
            </div>
            <button type="button" id="addEnvVar" class="add-env-btn">
                + Add Variable
            </button>
        </div>

        <div id="deploymentStatus" class="deployment-status"></div>
        
        <div class="action-buttons">
            <button type="submit" id="deployButton" class="deploy-btn">
                Deploy to Heroku
            </button>
        </div>
    </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('deploymentForm');
    const addEnvBtn = document.getElementById('addEnvVar');
    const envContainer = document.getElementById('envVariables');
    
    addEnvBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'env-row';
        row.innerHTML = \`
            <input type="text" class="env-key" 
                   placeholder="KEY" 
                   pattern="[A-Z0-9_]+" 
                   title="Uppercase letters, numbers and underscore only">
            <input type="text" class="env-value" 
                   placeholder="VALUE">
            <button type="button" class="remove-env" 
                    title="Remove variable">×</button>
        \`;
        envContainer.appendChild(row);
    });

    envContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-env')) {
            e.target.closest('.env-row').remove();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const deployButton = document.getElementById('deployButton');
        const statusDiv = document.getElementById('deploymentStatus');
        
        try {
            deployButton.disabled = true;
            statusDiv.innerHTML = 'Starting deployment...';
            statusDiv.className = 'deployment-status info';

            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(getFormData())
            });

            const result = await response.json();
            
            if (result.success) {
                statusDiv.innerHTML = \`
                    Deployment successful!<br>
                    App URL: <a href="\${result.url}" target="_blank">\${result.url}</a>
                \`;
                statusDiv.className = 'deployment-status success';
            } else {
                throw new Error(result.error || 'Deployment failed');
            }
        } catch (error) {
            statusDiv.innerHTML = \`Error: \${error.message}\`;
            statusDiv.className = 'deployment-status error';
        } finally {
            deployButton.disabled = false;
        }
    });

    function getFormData() {
        const envVars = {};
        document.querySelectorAll('.env-row').forEach(row => {
            const key = row.querySelector('.env-key').value;
            const value = row.querySelector('.env-value').value;
            if (key && value) {
                envVars[key] = value;
            }
        });

        return {
            name: document.getElementById('projectName').value,
            type: document.getElementById('projectType').value,
            env: envVars
        };
    }
});
</script>
`;

module.exports = deploymentForm;