const homeContent = `
    <h1>AI Project Generator</h1>
    <div>
        <label for="description">Project Description:</label>
        <textarea id="description" placeholder="Опишите ваш проект подробно..."></textarea>
    </div>
    <button onclick="generate()">Generate Structure</button>
    <div id="loading">Generating project...</div>
    <div id="error"></div>
    <div id="output"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js"></script>
    <script>
        async function generate() {
            const description = document.getElementById('description').value;
            const loading = document.getElementById('loading');
            const error = document.getElementById('error');
            const output = document.getElementById('output');

            loading.style.display = 'block';
            error.style.display = 'none';
            output.innerHTML = '';

            try {
                const structureResponse = await fetch('/api/generate-structure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description })
                });

                const structureData = await structureResponse.json();
                if (structureData.error) throw new Error(structureData.error);

                output.innerHTML = "<div class='code-section'>";
                output.innerHTML += "<div class='code-header'>Project Structure</div>";
                output.innerHTML += "<pre><code class='language-json'>" + 
                    JSON.stringify(structureData, null, 2) + "</code></pre>";
                output.innerHTML += "</div>";

                const codeResponse = await fetch('/api/generate-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, structure: structureData })
                });

                const codeData = await codeResponse.json();
                if (codeData.error) throw new Error(codeData.error);

                Object.entries(codeData).forEach(([filename, content]) => {
                    output.innerHTML += "<div class='code-section'>";
                    output.innerHTML += "<div class='code-header'>" + filename + "</div>";
                    output.innerHTML += "<pre><code>" + content + "</code></pre>";
                    output.innerHTML += "</div>";
                });

                Prism.highlightAll();
            } catch (err) {
                error.textContent = 'Error: ' + err.message;
                error.style.display = 'block';
            } finally {
                loading.style.display = 'none';
            }
        }
    </script>
`;

module.exports = homeContent;