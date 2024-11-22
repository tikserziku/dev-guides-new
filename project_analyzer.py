import os
import json
from colorama import init, Fore, Style
import re

# Initialize colorama
init()

def print_colored(text, color=Fore.WHITE, style=Style.NORMAL):
    print(f"{style}{color}{text}{Style.RESET_ALL}")

class ProjectAnalyzer:
    def __init__(self, project_path):
        self.project_path = project_path
        self.important_files = {
            'package.json': self.analyze_package_json,
            'README.md': self.analyze_readme,
            'index.html': self.analyze_html,
            'app.js': self.analyze_js,
            'main.js': self.analyze_js,
            'index.js': self.analyze_js,
            'style.css': self.analyze_css,
            'styles.css': self.analyze_css,
            'main.css': self.analyze_css
        }
        self.project_info = {
            'name': '',
            'description': '',
            'tech_stack': set(),
            'main_features': set(),
            'structure': {},
            'key_files_content': {}
        }

    def analyze_package_json(self, content):
        try:
            package_data = json.loads(content)
            self.project_info['name'] = package_data.get('name', '')
            self.project_info['description'] = package_data.get('description', '')
            
            # Analyze dependencies
            dependencies = {
                **package_data.get('dependencies', {}),
                **package_data.get('devDependencies', {})
            }
            
            # Identify main technologies
            if 'react' in dependencies:
                self.project_info['tech_stack'].add('React')
            if 'vue' in dependencies:
                self.project_info['tech_stack'].add('Vue.js')
            if 'next' in dependencies:
                self.project_info['tech_stack'].add('Next.js')
            if 'express' in dependencies:
                self.project_info['tech_stack'].add('Express.js')
            
            self.project_info['key_files_content']['package.json'] = dependencies
        except json.JSONDecodeError:
            print_colored("Error parsing package.json", Fore.RED)

    def analyze_readme(self, content):
        # Extract headers
        headers = re.findall(r'#{1,3}\s+(.+)', content)
        if headers:
            self.project_info['structure']['readme_sections'] = headers
        
        # Try to find features section
        features_match = re.search(r'#{1,3}\s+Features\s*\n((?:[-*]\s+[^\n]+\n?)+)', content, re.IGNORECASE)
        if features_match:
            features = re.findall(r'[-*]\s+([^\n]+)', features_match.group(1))
            self.project_info['main_features'].update(features)

    def analyze_html(self, content):
        # Look for main structural elements and technologies
        if '<react' in content.lower():
            self.project_info['tech_stack'].add('React')
        if '<vue' in content.lower():
            self.project_info['tech_stack'].add('Vue.js')
        if '<script type="module"' in content:
            self.project_info['tech_stack'].add('ES Modules')
        
        self.project_info['key_files_content']['index.html'] = content

    def analyze_js(self, content):
        # Look for imports and main functionality
        imports = re.findall(r'import\s+.*\s+from\s+[\'"](.+)[\'"]', content)
        if imports:
            self.project_info['structure']['imports'] = imports
        
        # Store the main JS logic
        self.project_info['key_files_content']['main_js'] = content

    def analyze_css(self, content):
        # Look for CSS features used
        if '@tailwind' in content:
            self.project_info['tech_stack'].add('Tailwind CSS')
        if '@media' in content:
            self.project_info['tech_stack'].add('Responsive Design')
        
        self.project_info['key_files_content']['main_css'] = content

    def analyze(self):
        print_colored("\nAnalyzing project structure...", Fore.CYAN)
        
        for root, _, files in os.walk(self.project_path):
            for file in files:
                if file in self.important_files:
                    file_path = os.path.join(root, file)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            content = f.read()
                            self.important_files[file](content)
                    except Exception as e:
                        print_colored(f"Error reading {file}: {e}", Fore.RED)

    def generate_report(self):
        print_colored("\n=== Project Analysis Report ===", Fore.GREEN, Style.BRIGHT)
        
        if self.project_info['name']:
            print_colored(f"\nProject Name: {self.project_info['name']}", Fore.CYAN)
        
        if self.project_info['description']:
            print_colored(f"\nDescription: {self.project_info['description']}", Fore.CYAN)
        
        if self.project_info['tech_stack']:
            print_colored("\nTechnology Stack:", Fore.YELLOW)
            for tech in sorted(self.project_info['tech_stack']):
                print(f"  • {tech}")
        
        if self.project_info['main_features']:
            print_colored("\nMain Features:", Fore.YELLOW)
            for feature in sorted(self.project_info['main_features']):
                print(f"  • {feature}")
        
        # Save detailed report to file
        report_path = os.path.join(self.project_path, 'project_analysis.txt')
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write("=== Detailed Project Analysis ===\n\n")
                f.write(f"Project Name: {self.project_info['name']}\n")
                f.write(f"Description: {self.project_info['description']}\n\n")
                
                f.write("=== Technology Stack ===\n")
                for tech in sorted(self.project_info['tech_stack']):
                    f.write(f"• {tech}\n")
                
                f.write("\n=== Main Features ===\n")
                for feature in sorted(self.project_info['main_features']):
                    f.write(f"• {feature}\n")
                
                f.write("\n=== Key Files Content ===\n")
                for file_name, content in self.project_info['key_files_content'].items():
                    f.write(f"\n--- {file_name} ---\n")
                    f.write(str(content)[:500] + "...\n" if len(str(content)) > 500 else str(content))
            
            print_colored(f"\nDetailed report saved to: {report_path}", Fore.GREEN)
            
        except Exception as e:
            print_colored(f"Error saving report: {e}", Fore.RED)

def main():
    project_path = r"G:\dev-guides-new"
    analyzer = ProjectAnalyzer(project_path)
    analyzer.analyze()
    analyzer.generate_report()

if __name__ == "__main__":
    main()