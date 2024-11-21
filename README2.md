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

## Planned Features
- Direct deployment to Heroku
- Project templates
- Code preview
- Multiple project management

## Generated Project Example
The platform can generate various web applications, including:
- Digital clocks
- Calculators
- Games
- And other web applications

## Technical Stack
- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- API: Claude AI
- Deployment: Heroku
- Version Control: Git

## Setup Development Environment
1. Clone repository
2. Install dependencies: `npm install`
3. Set environment variables:
   - CLAUDE_API_KEY
4. Run locally: `npm start`

## Deployment
New projects can be deployed to Heroku using:
```bash
heroku create [app-name]
git push heroku main
Project Structure
Copydev-guides-new/
├── server.js           # Main server file
├── services/          
│   └── claude.js      # Claude API service
├── public/            # Static files
└── README.md         # Documentation
Future Development

Project template system
Multiple deployment targets
Enhanced code generation
Project management UI
