import subprocess
import os
import sys
from pathlib import Path

def run_command(command):
    """Execute command and return output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error executing command: {command}")
            print(f"Error message: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception while executing command: {e}")
        return False

def setup_environment():
    base_path = r"G:\dev-guides-new"
    venv_path = os.path.join(base_path, "python_env")
    
    print("Setting up Python virtual environment...")
    
    # Create virtual environment
    if not run_command(f"python -m venv {venv_path}"):
        return False
    
    # Activate virtual environment and install requirements
    activate_script = os.path.join(venv_path, "Scripts", "activate")
    requirements = [
        "gitpython",
        "python-dotenv",
    ]
    
    # Install requirements
    req_string = " ".join(requirements)
    if not run_command(f"{activate_script} && pip install {req_string}"):
        return False
    
    print("Virtual environment created successfully!")
    return True

def create_gitignore():
    gitignore_path = r"G:\dev-guides-new\.gitignore"
    
    gitignore_content = """# Dependencies
node_modules/
npm-debug.log
yarn-debug.log
yarn-error.log

# Environment
.env
.env.local
.env.*.local
python_env/
venv/
.venv/
env/
.Python

# Python
*.py[cod]
*$py.class
__pycache__/
*.so
.Python
pip-log.txt
pip-delete-this-directory.txt
.tox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
pytestdebug.log

# IDE
.idea/
.vscode/
*.sublime-project
*.sublime-workspace
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db
*.tmp
*.bak
*.swp
*~.nib
Desktop.ini
ehthumbs.db

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build
dist/
build/
out/
.next/
.nuxt/
.vuepress/dist

# Temp files
*.swp
*.swo
*~
.*.sw[a-p]

# Local development
.env.local
.env.development.local
.env.test.local
.env.production.local

# Project specific
repository_index.txt

# Do not ignore project-audit.md (local documentation)
!project-audit.md
"""
    
    try:
        with open(gitignore_path, 'w', encoding='utf-8') as f:
            f.write(gitignore_content)
        print("Updated .gitignore file successfully!")
        return True
    except Exception as e:
        print(f"Error creating .gitignore: {e}")
        return False

def main():
    if setup_environment() and create_gitignore():
        print("\nSetup completed successfully!")
        print("\nTo activate the virtual environment:")
        print(r"G:\dev-guides-new\python_env\Scripts\activate")
        print("\nTo run the directory scanner script, activate the environment and run:")
        print("python scan_directory.py")
    else:
        print("\nSetup failed!")

if __name__ == "__main__":
    main()