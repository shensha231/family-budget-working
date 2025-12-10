#!/usr/bin/env python3
"""
Скрипт для запуска приложения.
"""
import os
import sys

# Добавляем текущую директорию в путь Python
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

if __name__ == '__main__':
    # Проверяем необходимые переменные окружения
    required_env_vars = ['SECRET_KEY']
    missing = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing:
        print(f"Ошибка: отсутствуют переменные окружения: {', '.join(missing)}")
        print("Создайте файл .env или установите переменные окружения")
        sys.exit(1)
    
    # Запускаем приложение
    app.run(
        host=os.getenv('HOST', '0.0.0.0'),
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    )