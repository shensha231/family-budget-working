"""
Интернационализация и локализация для приложения управления финансами.
"""

from flask import request, session, g
from flask_babel import Babel, gettext as _, lazy_gettext as _l
import gettext
import os


class I18NManager:
    """
    Менеджер интернационализации приложения.
    
    Обеспечивает:
    - Поддержку нескольких языков
    - Автоматическое определение языка
    - Динамическое переключение языка
    - Локализацию дат, чисел, валют
    """
    
    def __init__(self, app=None):
        """
        Инициализация менеджера интернационализации.
        
        Args:
            app: Flask приложение (опционально)
        """
        self.babel = None
        self.app = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """
        Инициализация менеджера для Flask приложения.
        
        Args:
            app: Flask приложение
        """
        self.app = app
        self.babel = Babel(app)
        
        # Устанавливаем путь к папке с переводами
        app.config.setdefault('BABEL_TRANSLATION_DIRECTORIES', 'locales')
        
        # Регистрируем функцию определения языка
        @self.babel.localeselector
        def get_locale():
            return self._select_locale()
        
        # Добавляем контекстный процессор для текущего языка
        @app.context_processor
        def inject_i18n():
            return dict(
                get_locale=self._select_locale,
                supported_languages=self.get_supported_languages(),
                current_language=self._select_locale()
            )
    
    def _select_locale(self):
        """
        Определение текущего языка.
        
        Приоритеты:
        1. Язык из параметра URL (?lang=)
        2. Язык из сессии
        3. Язык пользователя из БД (если аутентифицирован)
        4. Язык из заголовков браузера
        5. Язык по умолчанию
        
        Returns:
            str: Код языка (например, 'en', 'ru')
        """
        # 1. Из параметра URL
        lang = request.args.get('lang')
        if lang in self.app.config.get('SUPPORTED_LANGUAGES', ['en', 'ru']):
            session['language'] = lang
            return lang
        
        # 2. Из сессии
        if 'language' in session:
            return session['language']
        
        # 3. Из БД пользователя (если аутентифицирован)
        if hasattr(g, 'user') and g.user:
            # Здесь нужно получить язык пользователя из БД
            # Временная заглушка
            user_lang = getattr(g.user, 'language', None)
            if user_lang in self.app.config.get('SUPPORTED_LANGUAGES'):
                return user_lang
        
        # 4. Из заголовков браузера
        browser_lang = request.accept_languages.best_match(
            self.app.config.get('SUPPORTED_LANGUAGES', ['en', 'ru'])
        )
        if browser_lang:
            return browser_lang
        
        # 5. Язык по умолчанию
        return self.app.config.get('BABEL_DEFAULT_LOCALE', 'en')
    
    def set_language(self, language_code):
        """
        Установка языка для текущей сессии.
        
        Args:
            language_code (str): Код языка (например, 'en', 'ru')
        
        Returns:
            bool: Успешно ли установлен язык
        """
        if language_code in self.app.config.get('SUPPORTED_LANGUAGES', ['en', 'ru']):
            session['language'] = language_code
            return True
        return False
    
    def get_supported_languages(self):
        """
        Получение списка поддерживаемых языков.
        
        Returns:
            list: Список словарей с информацией о языках
        """
        return [
            {
                'code': 'en',
                'name': 'English',
                'native': 'English',
                'flag': '🇺🇸'
            },
            {
                'code': 'ru',
                'name': 'Russian',
                'native': 'Русский',
                'flag': '🇷🇺'
            }
        ]
    
    def get_current_language_info(self):
        """
        Получение информации о текущем языке.
        
        Returns:
            dict: Информация о текущем языке
        """
        current_lang = self._select_locale()
        for lang in self.get_supported_languages():
            if lang['code'] == current_lang:
                return lang
        return self.get_supported_languages()[0]
    
    def translate_date(self, date_obj, format='medium'):
        """
        Локализация даты.
        
        Args:
            date_obj: Объект datetime или date
            format (str): Формат ('full', 'long', 'medium', 'short')
        
        Returns:
            str: Локализованная дата
        """
        from babel.dates import format_date
        
        format_map = {
            'full': 'full',
            'long': 'long',
            'medium': 'medium',
            'short': 'short'
        }
        
        date_format = format_map.get(format, 'medium')
        return format_date(date_obj, format=date_format, locale=self._select_locale())
    
    def translate_datetime(self, datetime_obj, format='medium'):
        """
        Локализация даты и времени.
        
        Args:
            datetime_obj: Объект datetime
            format (str): Формат ('full', 'long', 'medium', 'short')
        
        Returns:
            str: Локализованные дата и время
        """
        from babel.dates import format_datetime
        
        format_map = {
            'full': "EEEE, d. MMMM y 'at' HH:mm",
            'long': "d MMMM y 'at' HH:mm",
            'medium': "d MMM y HH:mm",
            'short': "dd.MM.yy HH:mm"
        }
        
        datetime_format = format_map.get(format, format)
        return format_datetime(datetime_obj, format=datetime_format, locale=self._select_locale())
    
    def translate_currency(self, amount, currency='USD'):
        """
        Локализация валюты.
        
        Args:
            amount (float): Сумма
            currency (str): Код валюты ('USD', 'EUR', 'RUB', etc.)
        
        Returns:
            str: Локализованная сумма с валютой
        """
        from babel.numbers import format_currency
        
        # Определяем символ валюты на основе языка
        currency_symbols = {
            'en': {'USD': '$', 'EUR': '€', 'RUB': '₽'},
            'ru': {'USD': '$', 'EUR': '€', 'RUB': '₽'}
        }
        
        lang = self._select_locale()
        symbol = currency_symbols.get(lang, {}).get(currency, currency)
        
        return format_currency(
            amount,
            currency,
            format='#,##0.00 ¤',
            locale=lang,
            currency_digits=True
        )
    
    def translate_number(self, number):
        """
        Локализация числа.
        
        Args:
            number: Число для локализации
        
        Returns:
            str: Локализованное число
        """
        from babel.numbers import format_decimal
        
        return format_decimal(number, locale=self._select_locale())
    
    def get_plural_form(self, number, singular, plural):
        """
        Получение правильной формы слова в зависимости от числа.
        
        Args:
            number (int): Число
            singular (str): Форма для единственного числа
            plural (str): Форма для множественного числа
        
        Returns:
            str: Правильная форма слова
        """
        lang = self._select_locale()
        
        # Правила для разных языков
        rules = {
            'en': lambda n: singular if n == 1 else plural,
            'ru': lambda n: (
                singular if n % 10 == 1 and n % 100 != 11 else
                plural if 2 <= n % 10 <= 4 and not (12 <= n % 100 <= 14) else
                plural + '2'  # Для других случаев (0, 5-9, 11-14)
            )
        }
        
        rule = rules.get(lang, rules['en'])
        return rule(number)


# Создание глобального экземпляра менеджера
i18n_manager = I18NManager()


# Удобные функции-обертки
def gettext(string, **kwargs):
    """
    Получение перевода строки.
    
    Args:
        string (str): Строка для перевода
        **kwargs: Параметры для подстановки
    
    Returns:
        str: Переведенная строка
    """
    return _(string, **kwargs)


def ngettext(singular, plural, n, **kwargs):
    """
    Получение перевода с учетом числа.
    
    Args:
        singular (str): Форма для единственного числа
        plural (str): Форма для множественного числа
        n (int): Число
        **kwargs: Параметры для подстановки
    
    Returns:
        str: Переведенная строка с правильной формой
    """
    from flask_babel import ngettext as babel_ngettext
    return babel_ngettext(singular, plural, n, **kwargs)


def lazy_gettext(string):
    """
    Ленивый перевод (для использования в формах).
    
    Args:
        string (str): Строка для перевода
    
    Returns:
        LazyString: Ленивая строка перевода
    """
    return _l(string)


# Контекстный процессор для шаблонов
def i18n_context_processor():
    """
    Контекстный процессор для добавления i18n функций в шаблоны.
    
    Returns:
        dict: Функции для использования в шаблонах
    """
    return {
        '_': gettext,
        '_n': ngettext,
        'get_locale': i18n_manager._select_locale,
        'translate_date': i18n_manager.translate_date,
        'translate_currency': i18n_manager.translate_currency,
        'translate_number': i18n_manager.translate_number,
        'get_plural_form': i18n_manager.get_plural_form,
        'supported_languages': i18n_manager.get_supported_languages(),
        'current_language': i18n_manager.get_current_language_info()
    }