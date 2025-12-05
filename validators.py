"""
Кастомные валидаторы для форм приложения управления финансами.
"""

import re
from datetime import date, datetime
from wtforms.validators import ValidationError
from flask import current_app


class EmailValidator:
    """
    Валидатор для проверки email адресов.
    
    Проверяет:
    - Формат email
    - Домены временных email сервисов
    - Максимальную длину
    """
    
    # Список доменов временных email сервисов
    TEMP_EMAIL_DOMAINS = {
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'dispostable.com',
        'trashmail.com', 'fakeinbox.com', 'getairmail.com'
    }
    
    # Регулярное выражение для проверки формата email
    EMAIL_REGEX = re.compile(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    )
    
    def __init__(self, message=None, check_temp=True, max_length=255):
        """
        Инициализация валидатора.
        
        Args:
            message (str): Сообщение об ошибке
            check_temp (bool): Проверять временные email
            max_length (int): Максимальная длина email
        """
        self.check_temp = check_temp
        self.max_length = max_length
        
        if message is None:
            message = 'Некорректный email адрес'
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        email = field.data
        
        if not email:
            return
        
        # Проверка длины
        if len(email) > self.max_length:
            raise ValidationError(f'Email не должен превышать {self.max_length} символов')
        
        # Проверка формата
        if not self.EMAIL_REGEX.match(email):
            raise ValidationError(self.message)
        
        # Проверка временных email сервисов
        if self.check_temp:
            domain = email.split('@')[1].lower()
            if domain in self.TEMP_EMAIL_DOMAINS:
                raise ValidationError('Временные email адреса не разрешены')


class PasswordStrengthValidator:
    """
    Валидатор для проверки силы пароля.
    
    Требования к паролю:
    - Минимум 8 символов
    - Хотя бы одна цифра
    - Хотя бы одна буква
    - Хотя бы один специальный символ (опционально)
    - Не более 128 символов
    """
    
    def __init__(self, message=None, require_special=True):
        """
        Инициализация валидатора.
        
        Args:
            message (str): Сообщение об ошибке
            require_special (bool): Требовать специальные символы
        """
        self.require_special = require_special
        
        if message is None:
            message = (
                'Пароль должен содержать минимум 8 символов, '
                'включая цифры и буквы'
            )
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        password = field.data
        
        if not password:
            return
        
        # Проверка минимальной длины
        if len(password) < 8:
            raise ValidationError('Пароль должен быть не менее 8 символов')
        
        # Проверка максимальной длины
        if len(password) > 128:
            raise ValidationError('Пароль не должен превышать 128 символов')
        
        # Проверка наличия цифр
        if not re.search(r'\d', password):
            raise ValidationError('Пароль должен содержать хотя бы одну цифру')
        
        # Проверка наличия букв
        if not re.search(r'[a-zA-Z]', password):
            raise ValidationError('Пароль должен содержать хотя бы одну букву')
        
        # Проверка специальных символов (если требуется)
        if self.require_special:
            if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
                raise ValidationError(
                    'Пароль должен содержать хотя бы один специальный символ'
                )
        
        # Проверка на простые пароли
        common_passwords = [
            'password', '12345678', 'qwerty123', 'admin123',
            'letmein', 'welcome', 'password123', 'abc123'
        ]
        if password.lower() in common_passwords:
            raise ValidationError('Этот пароль слишком распространен')


class FutureDateValidator:
    """
    Валидатор для проверки, что дата не в будущем.
    
    Используется для транзакций, которые не могут быть датированы будущим.
    """
    
    def __init__(self, message=None, allow_today=True):
        """
        Инициализация валидатора.
        
        Args:
            message (str): Сообщение об ошибке
            allow_today (bool): Разрешить сегодняшнюю дату
        """
        self.allow_today = allow_today
        
        if message is None:
            message = 'Дата не может быть в будущем'
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        if not field.data:
            return
        
        if not isinstance(field.data, date):
            try:
                field_date = datetime.strptime(str(field.data), '%Y-%m-%d').date()
            except ValueError:
                raise ValidationError('Некорректный формат даты')
        else:
            field_date = field.data
        
        today = date.today()
        
        if field_date > today or (not self.allow_today and field_date == today):
            raise ValidationError(self.message)


class AmountValidator:
    """
    Валидатор для проверки суммы транзакции.
    
    Проверяет:
    - Минимальное значение
    - Максимальное значение
    - Формат (два знака после запятой)
    """
    
    def __init__(self, min_value=0.01, max_value=1000000, message=None):
        """
        Инициализация валидатора.
        
        Args:
            min_value (float): Минимальная сумма
            max_value (float): Максимальная сумма
            message (str): Сообщение об ошибке
        """
        self.min_value = min_value
        self.max_value = max_value
        
        if message is None:
            message = f'Сумма должна быть от {min_value} до {max_value}'
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        if field.data is None:
            raise ValidationError('Сумма обязательна')
        
        try:
            amount = float(field.data)
        except ValueError:
            raise ValidationError('Некорректный формат суммы')
        
        # Проверка минимального значения
        if amount < self.min_value:
            raise ValidationError(f'Минимальная сумма: {self.min_value}')
        
        # Проверка максимального значения
        if amount > self.max_value:
            raise ValidationError(f'Максимальная сумма: {self.max_value}')
        
        # Проверка формата (два знака после запятой)
        if abs(amount * 100 - int(amount * 100)) > 0.001:
            raise ValidationError('Сумма должна иметь не более двух знаков после запятой')


class ColorHexValidator:
    """
    Валидатор для проверки HEX цвета.
    
    Проверяет форматы:
    - #RRGGBB
    - #RGB
    """
    
    HEX_REGEX = re.compile(r'^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')
    
    def __init__(self, message=None):
        """
        Инициализация валидатора.
        
        Args:
            message (str): Сообщение об ошибке
        """
        if message is None:
            message = 'Введите корректный HEX цвет (#RRGGBB или #RGB)'
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        if not field.data:
            raise ValidationError('Цвет обязателен')
        
        if not self.HEX_REGEX.match(field.data):
            raise ValidationError(self.message)


class PhoneValidator:
    """
    Валидатор для проверки номера телефона.
    
    Поддерживает российские номера телефонов.
    """
    
    # Российские коды операторов
    RUSSIAN_OPERATORS = {
        '900', '901', '902', '903', '904', '905', '906', '908', '909',
        '910', '911', '912', '913', '914', '915', '916', '917', '918',
        '919', '920', '921', '922', '923', '924', '925', '926', '927',
        '928', '929', '930', '931', '932', '933', '934', '936', '937',
        '938', '939', '941', '950', '951', '952', '953', '954', '955',
        '956', '958', '960', '961', '962', '963', '964', '965', '966',
        '967', '968', '969', '970', '971', '972', '973', '974', '975',
        '976', '977', '978', '979', '980', '981', '982', '983', '984',
        '985', '986', '987', '988', '989'
    }
    
    def __init__(self, message=None, country='RU'):
        """
        Инициализация валидатора.
        
        Args:
            message (str): Сообщение об ошибке
            country (str): Код страны (по умолчанию Россия)
        """
        self.country = country
        
        if message is None:
            message = 'Введите корректный номер телефона'
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        if not field.data:
            return
        
        phone = field.data
        
        # Убираем все нецифровые символы
        digits = re.sub(r'\D', '', phone)
        
        # Для российских номеров
        if self.country == 'RU':
            # Проверка длины
            if len(digits) not in [10, 11]:
                raise ValidationError('Некорректная длина номера телефона')
            
            # Если 11 цифр, первая должна быть 7 или 8
            if len(digits) == 11:
                if digits[0] not in ['7', '8']:
                    raise ValidationError('Некорректный код страны')
                digits = digits[1:]  # Убираем код страны
            
            # Проверка кода оператора (первые 3 цифры)
            operator_code = digits[:3]
            if operator_code not in self.RUSSIAN_OPERATORS:
                raise ValidationError('Некорректный код оператора')
        
        # Проверяем, что остались только цифры
        if not digits.isdigit():
            raise ValidationError('Номер телефона должен содержать только цифры')


class UniqueValidator:
    """
    Валидатор для проверки уникальности значения в базе данных.
    """
    
    def __init__(self, model, field_name, message=None, exclude_id=None):
        """
        Инициализация валидатора.
        
        Args:
            model: Модель SQLAlchemy для проверки
            field_name (str): Имя поля для проверки уникальности
            message (str): Сообщение об ошибке
            exclude_id: ID записи для исключения (при обновлении)
        """
        self.model = model
        self.field_name = field_name
        self.exclude_id = exclude_id
        
        if message is None:
            message = 'Это значение уже используется'
        self.message = message
    
    def __call__(self, form, field):
        """Выполнение валидации."""
        if not field.data:
            return
        
        from database import db
        
        # Строим запрос
        query = db.session.query(self.model).filter(
            getattr(self.model, self.field_name) == field.data
        )
        
        # Исключаем текущую запись при обновлении
        if self.exclude_id is not None:
            query = query.filter(self.model.id != self.exclude_id)
        
        # Если запись найдена - ошибка
        if query.first():
            raise ValidationError(self.message)