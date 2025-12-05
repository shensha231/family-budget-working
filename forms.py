"""
Формы с валидацией для приложения управления финансами.
Использует WTForms с кастомными валидаторами.
"""

from flask_wtf import FlaskForm
from wtforms import (
    StringField, PasswordField, DecimalField, SelectField,
    TextAreaField, DateField, SubmitField, BooleanField,
    HiddenField, FloatField, IntegerField
)
from wtforms.validators import (
    DataRequired, Email, Length, EqualTo, Optional,
    NumberRange, Regexp, ValidationError
)
from datetime import date, datetime, timedelta
import re

from validators import (
    EmailValidator, PasswordStrengthValidator,
    FutureDateValidator, AmountValidator,
    ColorHexValidator, PhoneValidator, UniqueValidator
)


class RegistrationForm(FlaskForm):
    """
    Форма регистрации нового пользователя.
    
    Валидация:
    - Уникальность email и username
    - Сила пароля
    - Формат email
    - Подтверждение пароля
    """
    
    username = StringField('Имя пользователя', validators=[
        DataRequired(message='Имя пользователя обязательно для заполнения'),
        Length(
            min=3,
            max=50,
            message='Имя пользователя должно быть от 3 до 50 символов'
        ),
        Regexp(
            r'^[a-zA-Z0-9_]+$',
            message='Имя пользователя может содержать только буквы, цифры и подчеркивания'
        ),
        # UniqueValidator будет добавлен динамически в маршруте
    ])
    
    email = StringField('Email адрес', validators=[
        DataRequired(message='Email обязателен для заполнения'),
        Email(message='Введите корректный email адрес'),
        EmailValidator(),
        Length(max=120, message='Email не должен превышать 120 символов'),
        # UniqueValidator будет добавлен динамически в маршруте
    ])
    
    phone = StringField('Номер телефона (опционально)', validators=[
        Optional(),
        PhoneValidator(),
        Length(max=20, message='Номер телефона не должен превышать 20 символов')
    ])
    
    password = PasswordField('Пароль', validators=[
        DataRequired(message='Пароль обязателен для заполнения'),
        PasswordStrengthValidator(require_special=True),
        Length(min=8, max=128, message='Пароль должен быть от 8 до 128 символов')
    ])
    
    confirm_password = PasswordField('Подтверждение пароля', validators=[
        DataRequired(message='Подтвердите пароль'),
        EqualTo('password', message='Пароли должны совпадать')
    ])
    
    agree_terms = BooleanField('Я согласен с условиями использования', validators=[
        DataRequired(message='Вы должны согласиться с условиями использования')
    ])
    
    submit = SubmitField('Зарегистрироваться')
    
    def validate_username(self, field):
        """Дополнительная валидация имени пользователя."""
        # Проверка на недопустимые имена
        reserved_names = [
            'admin', 'administrator', 'root', 'superuser',
            'support', 'help', 'info', 'contact'
        ]
        if field.data.lower() in reserved_names:
            raise ValidationError('Это имя пользователя зарезервировано')
    
    def validate_email(self, field):
        """Дополнительная валидация email."""
        # Проверка на публичные email домены (опционально)
        public_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
        domain = field.data.split('@')[1].lower()
        
        # Можно добавить логику, если требуется
        # Например, запретить определенные домены


class LoginForm(FlaskForm):
    """
    Форма входа в систему.
    
    Валидация:
    - Формат email
    - Наличие пароля
    """
    
    email = StringField('Email', validators=[
        DataRequired(message='Введите email'),
        Email(message='Введите корректный email адрес'),
        Length(max=120, message='Email не должен превышать 120 символов')
    ])
    
    password = PasswordField('Пароль', validators=[
        DataRequired(message='Введите пароль'),
        Length(min=1, max=128, message='Неверная длина пароля')
    ])
    
    remember = BooleanField('Запомнить меня', default=False)
    
    submit = SubmitField('Войти')


class TransactionForm(FlaskForm):
    """
    Форма добавления или редактирования транзакции.
    
    Валидация:
    - Сумма (мин/макс, формат)
    - Категория (существующая)
    - Дата (не в будущем)
    - Описание (длина)
    """
    
    amount = DecimalField('Сумма', places=2, validators=[
        DataRequired(message='Введите сумму'),
        AmountValidator(min_value=0.01, max_value=1000000)
    ])
    
    category_id = SelectField(
        'Категория',
        coerce=int,
        validators=[DataRequired(message='Выберите категорию')]
    )
    
    transaction_type = SelectField('Тип операции', choices=[
        ('income', 'Доход'),
        ('expense', 'Расход')
    ], validators=[DataRequired(message='Выберите тип операции')])
    
    description = TextAreaField('Описание', validators=[
        Optional(),
        Length(max=500, message='Описание не должно превышать 500 символов')
    ])
    
    date = DateField('Дата', format='%Y-%m-%d', validators=[
        DataRequired(message='Выберите дату'),
        FutureDateValidator(allow_today=True)
    ], default=date.today)
    
    # Скрытое поле для ID транзакции при редактировании
    transaction_id = HiddenField()
    
    submit = SubmitField('Сохранить')
    
    def __init__(self, *args, user_id=None, **kwargs):
        """Инициализация формы с пользовательскими данными."""
        super().__init__(*args, **kwargs)
        
        # Динамически загружаем категории пользователя
        from database import db
        from models import Category
        
        if user_id:
            categories = Category.query.filter_by(user_id=user_id).all()
            self.category_id.choices = [
                (cat.id, cat.name) for cat in categories
            ]
            if not self.category_id.choices:
                self.category_id.choices = [(-1, 'Сначала создайте категорию')]
                self.category_id.render_kw = {'disabled': True}
    
    def validate_description(self, field):
        """Валидация описания."""
        if field.data:
            # Проверка на недопустимые слова
            forbidden_words = ['спам', 'реклама', 'мошенничество']
            for word in forbidden_words:
                if word in field.data.lower():
                    raise ValidationError('Описание содержит недопустимые слова')


class CategoryForm(FlaskForm):
    """
    Форма создания или редактирования категории.
    
    Валидация:
    - Название (уникальность, длина)
    - Цвет (HEX формат)
    - Тип (доход/расход)
    """
    
    name = StringField('Название категории', validators=[
        DataRequired(message='Введите название категории'),
        Length(min=2, max=50, message='Название должно быть от 2 до 50 символов'),
        Regexp(
            r'^[a-zA-Zа-яА-Я0-9\s\-_]+$',
            message='Название может содержать только буквы, цифры, пробелы, дефисы и подчеркивания'
        )
    ])
    
    category_type = SelectField('Тип категории', choices=[
        ('income', 'Только для доходов'),
        ('expense', 'Только для расходов'),
        ('both', 'Для доходов и расходов')
    ], validators=[DataRequired(message='Выберите тип категории')])
    
    color = StringField('Цвет', validators=[
        DataRequired(message='Выберите цвет'),
        ColorHexValidator()
    ], default='#3498db')
    
    icon = StringField('Иконка (Font Awesome класс)', validators=[
        Optional(),
        Length(max=50, message='Название иконки не должно превышать 50 символов'),
        Regexp(
            r'^fa[a-z]?-?[a-z0-9-]+$',
            message='Введите корректный класс Font Awesome (например: fa-shopping-cart)'
        )
    ], default='fa-folder')
    
    budget_limit = DecimalField(
        'Лимит бюджета (опционально)',
        places=2,
        validators=[
            Optional(),
            NumberRange(
                min=0.01,
                max=100000,
                message='Лимит бюджета должен быть от 0.01 до 100,000'
            )
        ]
    )
    
    # Скрытое поле для ID категории при редактировании
    category_id = HiddenField()
    
    submit = SubmitField('Сохранить категорию')
    
    def validate_name(self, field):
        """Валидация уникальности имени категории для пользователя."""
        # Проверка будет выполнена в маршруте с использованием UniqueValidator


class FilterForm(FlaskForm):
    """
    Форма фильтрации транзакций.
    
    Валидация:
    - Диапазон дат
    - Тип операции
    - Категория
    """
    
    start_date = DateField(
        'С',
        format='%Y-%m-%d',
        validators=[Optional()],
        default=date.today().replace(day=1)  # Первое число текущего месяца
    )
    
    end_date = DateField(
        'По',
        format='%Y-%m-%d',
        validators=[Optional()],
        default=date.today()
    )
    
    category_id = SelectField(
        'Категория',
        coerce=int,
        choices=[('0', 'Все категории')],
        validators=[Optional()]
    )
    
    transaction_type = SelectField('Тип операции', choices=[
        ('all', 'Все операции'),
        ('income', 'Доходы'),
        ('expense', 'Расходы')
    ], default='all', validators=[Optional()])
    
    min_amount = DecimalField(
        'Мин. сумма',
        places=2,
        validators=[
            Optional(),
            NumberRange(min=0, message='Минимальная сумма не может быть отрицательной')
        ]
    )
    
    max_amount = DecimalField(
        'Макс. сумма',
        places=2,
        validators=[
            Optional(),
            NumberRange(min=0, message='Максимальная сумма не может быть отрицательной')
        ]
    )
    
    search = StringField('Поиск по описанию', validators=[
        Optional(),
        Length(max=100, message='Поисковый запрос не должен превышать 100 символов')
    ])
    
    submit = SubmitField('Применить фильтры')
    
    def validate(self, extra_validators=None):
        """Дополнительная валидация формы фильтров."""
        if not super().validate():
            return False
        
        # Проверка диапазона дат
        if self.start_date.data and self.end_date.data:
            if self.start_date.data > self.end_date.data:
                self.end_date.errors.append('Конечная дата должна быть после начальной')
                return False
        
        # Проверка диапазона суммы
        if self.min_amount.data and self.max_amount.data:
            if self.min_amount.data > self.max_amount.data:
                self.max_amount.errors.append('Максимальная сумма должна быть больше минимальной')
                return False
        
        # Проверка, что даты не слишком далеко в прошлом
        if self.start_date.data:
            oldest_allowed = date.today() - timedelta(days=365 * 5)  # 5 лет
            if self.start_date.data < oldest_allowed:
                self.start_date.errors.append('Дата не может быть старше 5 лет')
                return False
        
        return True
    
    def __init__(self, *args, user_id=None, **kwargs):
        """Инициализация формы с категориями пользователя."""
        super().__init__(*args, **kwargs)
        
        # Динамически загружаем категории пользователя
        if user_id:
            from database import db
            from models import Category
            
            categories = Category.query.filter_by(user_id=user_id).order_by(Category.name).all()
            self.category_id.choices = [('0', 'Все категории')] + [
                (cat.id, cat.name) for cat in categories
            ]


class ProfileForm(FlaskForm):
    """
    Форма редактирования профиля пользователя.
    
    Валидация:
    - Имя пользователя (уникальность)
    - Email (уникальность, формат)
    - Телефон (формат)
    """
    
    username = StringField('Имя пользователя', validators=[
        DataRequired(message='Имя пользователя обязательно'),
        Length(min=3, max=50, message='Имя должно быть от 3 до 50 символов'),
        Regexp(
            r'^[a-zA-Z0-9_]+$',
            message='Имя пользователя может содержать только буквы, цифры и подчеркивания'
        )
    ])
    
    email = StringField('Email', validators=[
        DataRequired(message='Email обязателен'),
        Email(message='Введите корректный email адрес'),
        EmailValidator(),
        Length(max=120, message='Email не должен превышать 120 символов')
    ])
    
    phone = StringField('Номер телефона', validators=[
        Optional(),
        PhoneValidator(),
        Length(max=20, message='Номер телефона не должен превышать 20 символов')
    ])
    
    currency = SelectField('Валюта по умолчанию', choices=[
        ('USD', 'Доллар США ($)'),
        ('EUR', 'Евро (€)'),
        ('RUB', 'Рубль (₽)'),
        ('GBP', 'Фунт стерлингов (£)'),
        ('JPY', 'Иена (¥)')
    ], validators=[DataRequired(message='Выберите валюту')])
    
    language = SelectField('Язык интерфейса', choices=[
        ('en', 'English'),
        ('ru', 'Русский')
    ], validators=[DataRequired(message='Выберите язык')])
    
    monthly_budget = DecimalField(
        'Месячный бюджет (опционально)',
        places=2,
        validators=[
            Optional(),
            NumberRange(
                min=0,
                max=1000000,
                message='Бюджет должен быть от 0 до 1,000,000'
            )
        ]
    )
    
    submit = SubmitField('Сохранить изменения')


class PasswordChangeForm(FlaskForm):
    """
    Форма изменения пароля.
    
    Валидация:
    - Текущий пароль (совпадение)
    - Новый пароль (сила)
    - Подтверждение пароля
    """
    
    current_password = PasswordField('Текущий пароль', validators=[
        DataRequired(message='Введите текущий пароль'),
        Length(min=1, max=128, message='Неверная длина пароля')
    ])
    
    new_password = PasswordField('Новый пароль', validators=[
        DataRequired(message='Введите новый пароль'),
        PasswordStrengthValidator(require_special=True),
        Length(min=8, max=128, message='Пароль должен быть от 8 до 128 символов')
    ])
    
    confirm_password = PasswordField('Подтвердите новый пароль', validators=[
        DataRequired(message='Подтвердите новый пароль'),
        EqualTo('new_password', message='Пароли должны совпадать')
    ])
    
    submit = SubmitField('Изменить пароль')


class QuickTransactionForm(FlaskForm):
    """
    Упрощенная форма для быстрого добавления транзакции.
    Используется в виджетах на dashboard.
    """
    
    amount = DecimalField('Сумма', places=2, validators=[
        DataRequired(message='Введите сумму'),
        AmountValidator(min_value=0.01, max_value=10000)
    ])
    
    category_id = SelectField(
        'Категория',
        coerce=int,
        validators=[DataRequired(message='Выберите категорию')]
    )
    
    transaction_type = SelectField('Тип', choices=[
        ('income', '+'),
        ('expense', '-')
    ], validators=[DataRequired(message='Выберите тип')])
    
    description = StringField('Описание', validators=[
        Optional(),
        Length(max=100, message='Описание не должно превышать 100 символов')
    ])
    
    submit = SubmitField('Добавить')
    
    def __init__(self, *args, user_id=None, **kwargs):
        """Инициализация формы с часто используемыми категориями."""
        super().__init__(*args, **kwargs)
        
        if user_id:
            from database import db
            from models import Category
            
            # Берем только 10 самых используемых категорий для быстрого доступа
            categories = Category.query.filter_by(
                user_id=user_id
            ).order_by(Category.name).limit(10).all()
            
            self.category_id.choices = [
                (cat.id, cat.name) for cat in categories
            ]