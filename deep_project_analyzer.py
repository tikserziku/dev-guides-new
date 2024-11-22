import os
import json
from colorama import init, Fore, Style
import re

class DeepProjectAnalyzer:
    def __init__(self, project_path):
        self.project_path = project_path
        self.file_patterns = {
            # Конфигурационные файлы
            'config': ['.env', 'config.js', 'config.json', '.env.example'],
            # JavaScript/TypeScript файлы
            'js': ['.js', '.jsx', '.ts', '.tsx'],
            # Стили
            'styles': ['.css', '.scss', '.sass', '.less'],
            # Документация
            'docs': ['.md', '.mdx', 'README', 'CONTRIBUTING'],
            # Сборка и зависимости
            'build': ['package.json', 'webpack.config.js', 'rollup.config.js', 'tsconfig.json'],
            # Тесты
            'tests': ['test.js', 'spec.js', '.test.js', '.spec.js']
        }
        self.project_info = {
            'config_files': [],
            'source_files': [],
            'test_files': [],
            'doc_files': [],
            'dependencies': {},
            'scripts': {},
            'file_contents': {},
            'api_endpoints': [],
            'components': [],
            'exports': []
        }

    def read_file_content(self, file_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"{Fore.RED}Error reading {file_path}: {e}{Style.RESET_ALL}")
            return None

    def analyze_js_file(self, content, file_path):
        # Поиск экспортов
        exports = re.findall(r'export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)', content)
        if exports:
            self.project_info['exports'].extend(exports)

        # Поиск компонентов React
        components = re.findall(r'(?:class|function)\s+(\w+)\s*(?:extends\s+React\.Component|\(props\))', content)
        if components:
            self.project_info['components'].extend(components)

        # Поиск API endpoints
        api_patterns = [
            r'app\.(get|post|put|delete|patch)\s*\([\'"]([^\'"]+)[\'"]',
            r'router\.(get|post|put|delete|patch)\s*\([\'"]([^\'"]+)[\'"]',
            r'fetch\s*\([\'"]([^\'"]+)[\'"]',
            r'axios\.(get|post|put|delete|patch)\s*\([\'"]([^\'"]+)[\'"]'
        ]
        
        for pattern in api_patterns:
            endpoints = re.findall(pattern, content)
            if endpoints:
                self.project_info['api_endpoints'].extend(
                    [endpoint[1] if len(endpoint) > 1 else endpoint[0] for endpoint in endpoints]
                )

    def analyze_package_json(self, content):
        try:
            data = json.loads(content)
            self.project_info['dependencies'] = {
                'dependencies': data.get('dependencies', {}),
                'devDependencies': data.get('devDependencies', {})
            }
            self.project_info['scripts'] = data.get('scripts', {})
            return data
        except json.JSONDecodeError:
            print(f"{Fore.RED}Error parsing package.json{Style.RESET_ALL}")
            return None

    def analyze(self):
        print(f"{Fore.CYAN}Starting deep project analysis...{Style.RESET_ALL}")
        
        for root, dirs, files in os.walk(self.project_path):
            # Пропускаем node_modules и другие служебные директории
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            if '.git' in dirs:
                dirs.remove('.git')

            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, self.project_path)
                
                # Определяем тип файла
                ext = os.path.splitext(file)[1].lower()
                
                if file == 'package.json':
                    content = self.read_file_content(file_path)
                    if content:
                        self.analyze_package_json(content)
                        self.project_info['file_contents']['package.json'] = content
                
                elif ext in ['.js', '.jsx', '.ts', '.tsx']:
                    content = self.read_file_content(file_path)
                    if content:
                        self.analyze_js_file(content, relative_path)
                        self.project_info['source_files'].append(relative_path)
                        if len(self.project_info['file_contents']) < 5:  # Ограничиваем количество сохраняемых файлов
                            self.project_info['file_contents'][relative_path] = content

    def generate_report(self):
        report = []
        report.append("=== Подробный анализ проекта ===\n")

        # Основные файлы
        if self.project_info['source_files']:
            report.append("\n=== Основные файлы проекта ===")
            for file in sorted(self.project_info['source_files']):
                report.append(f"• {file}")

        # Компоненты
        if self.project_info['components']:
            report.append("\n=== Компоненты ===")
            for comp in sorted(set(self.project_info['components'])):
                report.append(f"• {comp}")

        # API Endpoints
        if self.project_info['api_endpoints']:
            report.append("\n=== API Endpoints ===")
            for endpoint in sorted(set(self.project_info['api_endpoints'])):
                report.append(f"• {endpoint}")

        # Зависимости
        if self.project_info['dependencies']:
            report.append("\n=== Зависимости ===")
            deps = self.project_info['dependencies'].get('dependencies', {})
            dev_deps = self.project_info['dependencies'].get('devDependencies', {})
            
            if deps:
                report.append("\nОсновные зависимости:")
                for dep, version in deps.items():
                    report.append(f"• {dep}: {version}")
            
            if dev_deps:
                report.append("\nЗависимости для разработки:")
                for dep, version in dev_deps.items():
                    report.append(f"• {dep}: {version}")

        # npm скрипты
        if self.project_info['scripts']:
            report.append("\n=== npm скрипты ===")
            for script, command in self.project_info['scripts'].items():
                report.append(f"• {script}: {command}")

        # Содержимое важных файлов
        if self.project_info['file_contents']:
            report.append("\n=== Содержимое важных файлов ===")
            for file_name, content in self.project_info['file_contents'].items():
                report.append(f"\n--- {file_name} ---")
                # Ограничиваем вывод содержимого файла
                content_preview = content[:1000] + "..." if len(content) > 1000 else content
                report.append(content_preview)

        # Сохраняем отчет
        report_path = os.path.join(self.project_path, 'deep_project_analysis.txt')
        try:
            with open(report_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(report))
            print(f"{Fore.GREEN}Подробный отчет сохранен в: {report_path}{Style.RESET_ALL}")
        except Exception as e:
            print(f"{Fore.RED}Ошибка при сохранении отчета: {e}{Style.RESET_ALL}")

def main():
    project_path = r"G:\dev-guides-new"
    analyzer = DeepProjectAnalyzer(project_path)
    analyzer.analyze()
    analyzer.generate_report()

if __name__ == "__main__":
    main()