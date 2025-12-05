"""
Конфигурация приложения управления семейными финансами.
Поддержка разных окружений: development, testing, production.
"""

import os
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Базовый класс конфигурации
class Config:
    """Базовая конфигурация."""
    
    # Безопасность
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # База данных
    DATABASE_PATH = os.environ.get('DATABASE_PATH', 'family_finance.db')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Аутентификация
    BCRYPT_LOG_ROUNDS = int(os.environ.get('BCRYPT_LOG_ROUNDS', 12))
    LOGIN_DISABLED = False
    
    # Интернационализация
    BABEL_DEFAULT_LOCALE = os.environ.get('BABEL_DEFAULT_LOCALE', 'en')
    BABEL_DEFAULT_TIMEZONE = os.environ.get('BABEL_DEFAULT_TIMEZONE', 'UTC')
    SUPPORTED_LANGUAGES = ['en', 'ru']
    
    # Загрузка файлов
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB максимум
    
    # CSRF защита
    WTF_CSRF_ENABLED = True
    WTF_CSRF_SECRET_KEY = SECRET_KEY
    
    # Сессии
    SESSION_COOKIE_SECURE = False  # True для HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    @staticmethod
    def init_app(app):
        """Инициализация конфигурации для приложения."""
        pass


class DevelopmentConfig(Config):
    """Конфигурация для разработки."""
    
    DEBUG = True
    FLASK_ENV = 'development'
    
    # Отключаем кеширование шаблонов для удобства разработки
    TEMPLATES_AUTO_RELOAD = True
    EXPLAIN_TEMPLATE_LOADING = False
    
    # SQLAlchemy отладка
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    """Конфигурация для тестирования."""
    
    TESTING = True
    DEBUG = True
    
    # Тестовая база данных
    DATABASE_PATH = 'test_family_finance.db'
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    
    # Отключаем CSRF для тестов
    WTF_CSRF_ENABLED = False
    
    # Отключаем bcrypt для скорости тестов
    BCRYPT_LOG_ROUNDS = 4
    
    # Серверный тестовый режим
    SERVER_NAME = 'localhost.test'
    APPLICATION_ROOT = '/'
    PREFERRED_URL_SCHEME = 'http'


class ProductionConfig(Config):
    """Конфигурация для продакшена."""
    
    DEBUG = False
    FLASK_ENV = 'production'
    
    # Безопасность
    SESSION_COOKIE_SECURE = True  # Только HTTPS
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    
    # Более строгие настройки bcrypt
    BCRYPT_LOG_ROUNDS = 15
    
    # Отключаем отладочную информацию
    ERROR_404_HELP = False
    
    @classmethod
    def init_app(cls, app):
        """Инициализация для продакшена."""
        Config.init_app(app)
        
        # Логирование ошибок
        import logging
        from logging.handlers import RotatingFileHandler
        
        # Создаем папку для логов если её нет
        if not os.path.exists('logs'):
            os.mkdir('logs')
        
        # Настройка файлового хендлера
        file_handler = RotatingFileHandler(
            'logs/family_finance.log',
            maxBytes=10240,
            backupCount=10
        )
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        ))
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Family Finance startup')


# Конфигурация по умолчанию
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config(config_name=None):
    """
    Получение конфигурации по имени.
    
    Args:
        config_name (str): Имя конфигурации (development, testing, production)
    
    Returns:
        Config: Объект конфигурации
    """
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    return config.get(config_name, config['default'])