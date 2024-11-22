# AI Code Generator and Deployment Platform

## Project Overview
This project consists of two main components:
1. AI Code Generator - Uses Claude API to generate project structures and code
2. Code Deployment System - Capability to deploy generated projects to Heroku

## Current Features
- Project structure generation
- Code generation with syntax highlighting
- Support for HTML, CSS, and JavaScript
- Integration with Claude API
- Documentation viewer

## Technical Stack
- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- API: Claude AI
- Deployment: Heroku
- Version Control: Git

## Project Structure
dev-guides-new/
├── server.js           # Main server file
├── services/
│   └── claude.js      # Claude API service
├── public/            # Static files
└── README.md         # Documentation
Copy
2. README2.md (техническая документация):
```markdown
# Development Guide

## 1. Environment Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables:
   - CLAUDE_API_KEY
4. Run locally: `npm start`

## 2. Commands
### Git Operations
```bash
git init
git add .
git commit -m "message"
git push heroku main
Heroku Deployment
bashCopyheroku create [app-name]
git push heroku main
3. Best Practices

Модульность кода
Понятные имена
Комментарии
Частые коммиты
Тестирование (TDD)

Copy
3. README3.md (примеры проектов):
```markdown
# Generated Projects Guide

## Available Project Types

### 1. Web Applications
- Digital Clocks
- Calculators
- Simple Games

### 2. Mobile Applications
Example Android app:
```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
3. Games
Example game structure:
javascriptCopyconst game = {
    init() {
        // Game initialization
    },
    update() {
        // Game loop
    }
}
Future Development

Project template system
Multiple deployment targets
Enhanced code generation
Project management UI

Copy
После создания файлов:
```powershell
git add .
git commit -m "Update documentation files"
git push heroku main