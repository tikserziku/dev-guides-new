﻿# Development Guide

## 1. Введение
Это руководство содержит лучшие практики и инструкции по разработке.

## 2. Работа с PowerShell и кодом

### 2.1 Замена частей кода в файлах

#### Полная перезапись файла
```powershell
@"
// Новый код здесь
"@ | Out-File -FilePath "filename.js" -Encoding UTF8

Замена конкретной части файла

(Get-Content filename.js) | ForEach-Object {
    if ($_ -match "искомый_паттерн") {
        @"
// Новый код здесь
"@
    } else { $_ }
} | Set-Content filename.js

3. Работа с Git
3.1 Основные команды

# Инициализация
git init

# Добавление файлов
git add filename.js
git add .  # все файлы

# Создание коммита
git commit -m "Описание изменений"

4. Работа с Heroku
4.1 Основные команды

# Создание приложения
heroku create app-name

# Деплой
git push heroku main

# Просмотр логов
heroku logs --tail

5. Лучшие практики
5.1 Организация кода

Разделяйте код на модули
Используйте понятные имена
Комментируйте сложные участки

5.2 Версионирование

Делайте частые коммиты
Пишите понятные сообщения
Используйте ветки для задач
