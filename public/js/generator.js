async function generate() {
    const description = document.getElementById('description').value;
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const output = document.getElementById('output');
    const button = document.querySelector('button');

    loading.style.display = 'block';
    error.style.display = 'none';
    output.innerHTML = '';
    button.disabled = true;
    button.style.opacity = '0.7';

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
        button.disabled = false;
        button.style.opacity = '1';
    }
}