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

module.exports = createPageTemplate;