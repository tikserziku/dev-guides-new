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
- Markdown-based documentation system
- Real-time code preview

## Technical Stack
- Backend: Node.js, Express
- Frontend: HTML, CSS, JavaScript
- AI Integration: Claude API
- Deployment: Heroku
- Version Control: Git
- Documentation: Marked (Markdown parser)

## Project Structure
```
dev-guides-new/
├── server.js           # Main server file
├── services/
│   └── claude.js      # Claude API service
├── public/            # Static files
├── README.md          # Main documentation
├── README2.md         # Development guide
└── README3.md         # Examples and tutorials
```

## Live Demo
Project is deployed on Heroku:
[https://dev-guides-new-dfdb4ff2b805.herokuapp.com/](https://dev-guides-new-dfdb4ff2b805.herokuapp.com/)

## Setup and Installation

### Local Development
1. Clone the repository:
```bash
git clone https://github.com/tikserziku/dev-guides-new.git
cd dev-guides-new
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
CLAUDE_API_KEY=your_api_key
PORT=3000
```

4. Run the development server:
```bash
npm start
```

### Deployment
The project is configured for automatic deployment to Heroku:

1. Push changes to deploy:
```bash
git push heroku main
```

2. View logs:
```bash
heroku logs --tail
```

## Documentation
The project includes three documentation sections:

1. Main Documentation (README.md)
   - Project overview
   - Setup instructions
   - Basic usage

2. Development Guide (README2.md)
   - Technical details
   - API documentation
   - Development workflow

3. Examples (README3.md)
   - Usage examples
   - Tutorials
   - Best practices

## Development Workflow

### Creating New Features
1. Create a feature branch:
```bash
git checkout -b feature/new-feature
```

2. Make changes and commit:
```bash
git add .
git commit -m "Description of changes"
```

3. Push to GitHub:
```bash
git push origin feature/new-feature
```

4. Deploy to Heroku:
```bash
git push heroku main
```

## API Endpoints

### Generate Project Structure
```
POST /api/generate-structure
Content-Type: application/json

{
    "description": "Project description"
}
```

### Generate Code
```
POST /api/generate-code
Content-Type: application/json

{
    "description": "Project description",
    "structure": "Project structure object"
}
```

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License.