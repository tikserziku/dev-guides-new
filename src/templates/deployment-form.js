const deploymentForm = `
<div class="deployment-container">
    <h2>Deploy Generated Project</h2>
    <form id="deploymentForm">
        <div class="form-group">
            <label for="projectName">Project Name</label>
            <input type="text" id="projectName" required>
        </div>

        <div class="form-group">
            <label for="projectType">Project Type</label>
            <select id="projectType">
                <option value="node-server">Node.js Server</option>
                <option value="node-static">Static Site</option>
                <option value="react-app">React App</option>
            </select>
        </div>

        <div class="form-group">
            <label>Environment Variables</label>
            <div id="envVariables">
                <div class="env-row">
                    <input type="text" class="env-key" placeholder="KEY">
                    <input type="text" class="env-value" placeholder="VALUE">
                    <button type="button" class="remove-env">×</button>
                </div>
            </div>
            <button type="button" id="addEnvVar">+ Add Variable</button>
        </div>

        <div class="deployment-status" id="deploymentStatus"></div>
        
        <div class="action-buttons">
            <button type="submit" id="deployButton">Deploy to Heroku</button>
        </div>
    </form>
</div>
`;

module.exports = deploymentForm;