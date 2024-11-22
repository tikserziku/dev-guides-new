import os
import json
from colorama import init, Fore, Style

class ProjectCodeExtractor:
    def __init__(self, project_path):
        self.project_path = project_path
        self.core_files = [
            'server.js',
            'services/claude.js',
            'public/js/generator.js',
            'src/utils/template.js',
            'src/config/index.js',
            'src/config/development.js',
            'src/config/production.js'
        ]
        
    def read_file_content(self, file_path):
        try:
            with open(os.path.join(self.project_path, file_path), 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {e}"
            
    def extract_and_save_files(self):
        output = []
        output.append("# Полный код основных файлов проекта\n")
        
        for file_path in self.core_files:
            output.append(f"\n## {file_path}\n")
            output.append("```javascript")
            content = self.read_file_content(file_path)
            output.append(content if content else f"Файл не найден: {file_path}")
            output.append("```\n")
            
            # Добавляем пояснение для каждого файла
            output.append("### Описание:")
            if "server.js" in file_path:
                output.append("""
- Основной файл сервера Express
- Обрабатывает HTTP запросы
- Отвечает за маршрутизацию
- Подключает статические файлы из директории public
- Интегрируется с API Claude
""")
            elif "claude.js" in file_path:
                output.append("""
- Сервис для работы с API Claude
- Отправляет запросы на генерацию структуры проекта
- Обрабатывает ответы от API
- Форматирует данные для фронтенда
""")
            elif "generator.js" in file_path:
                output.append("""
- Клиентский JavaScript код
- Обрабатывает пользовательский ввод
- Отправляет AJAX запросы на сервер
- Отображает результаты генерации
""")
            elif "template.js" in file_path:
                output.append("""
- Утилита для создания HTML шаблонов
- Генерирует разметку страницы
- Подставляет динамические данные
""")
            elif "config" in file_path:
                output.append("""
- Конфигурационные файлы
- Настройки для разных окружений
- Параметры API и сервера
""")
                
        # Сохраняем полный код в файл
        try:
            output_path = os.path.join(self.project_path, 'full_project_code.md')
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(output))
            print(f"{Fore.GREEN}Полный код проекта сохранен в: {output_path}{Style.RESET_ALL}")
        except Exception as e:
            print(f"{Fore.RED}Ошибка при сохранении кода: {e}{Style.RESET_ALL}")

def main():
    project_path = r"G:\dev-guides-new"
    extractor = ProjectCodeExtractor(project_path)
    extractor.extract_and_save_files()

if __name__ == "__main__":
    main()