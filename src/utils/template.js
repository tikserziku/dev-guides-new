// Общие стили для всех страниц
const commonStyles = `
    body {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Segoe UI', Arial, sans-serif;
        background: #f5f5f5;
        line-height: 1.6;
    }
    .container {
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .top-navigation {
        text-align: center;
        margin-bottom: 30px;
        padding: 15px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        position: sticky;
        top: 20px;
        z-index: 100;
    }
    .top-navigation a {
        margin: 0 20px;
        color: #0366d6;
        text-decoration: none;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.3s ease;
        font-weight: 500;
    }
    .top-navigation a:hover {
        background-color: #0366d6;
        color: white;
        transform: translateY(-1px);
    }
    .top-navigation a:active {
        transform: translateY(1px);
    }
    .markdown-body {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: white;
    }
    h1 {
        color: #2c3e50;
        font-size: 2.2em;
        margin-bottom: 30px;
        text-align: center;
    }
`;

// Функция создания шаблона страницы
const createPageTemplate = (title, content, additionalStyles = '') => `
<!DOCTYPE html>
<html>
<head>
    <title>${title}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" rel="stylesheet">
    <style>
        ${commonStyles}
        ${additionalStyles}
    </style>
</head>
<body>
    <div class="top-navigation">
        <a href="/">Home</a>
        <span class="divider">|</span>
        <a href="/readme1">Overview</a>
        <span class="divider">|</span>
        <a href="/readme2">Development</a>
        <span class="divider">|</span>
        <a href="/readme3">Examples</a>
    </div>
    <div class="container markdown-body">
        ${content}
    </div>
</body>
</html>
`;

module.exports = { createPageTemplate, commonStyles };