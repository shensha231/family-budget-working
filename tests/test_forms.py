"""
Тестирование форм приложения управления финансами.
"""

import pytest
from datetime import date, timedelta
from decimal import Decimal

from forms import (
    RegistrationForm, LoginForm, TransactionForm,
    CategoryForm, FilterForm, ProfileForm,
    PasswordChangeForm, QuickTransactionForm
)
from validators import (
    EmailValidator, PasswordStrengthValidator,
    FutureDateValidator, AmountValidator
)


class TestRegistrationForm:
    """Тесты формы регистрации."""
    
    def test_valid_registration_form(self):
        """Тест корректной формы регистрации."""
        form_data = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'phone': '+79161234567',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'agree_terms': True
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == True
    
    def test_registration_form_missing_required_fields(self):
        """Тест формы с отсутствующими обязательными полями."""
        form_data = {
            'username': '',
            'email': '',
            'password': '',
            'confirm_password': '',
            'agree_terms': False
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == False
        
        # Проверяем наличие ошибок
        assert 'username' in form.errors
        assert 'email' in form.errors
        assert 'password' in form.errors
        assert 'agree_terms' in form.errors
    
    def test_registration_form_weak_password(self):
        """Тест формы со слабым паролем."""
        form_data = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'password': '123',  # Слишком короткий
            'confirm_password': '123',
            'agree_terms': True
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == False
        assert 'password' in form.errors
    
    def test_registration_form_password_mismatch(self):
        """Тест формы с несовпадающими паролями."""
        form_data = {
            'username': 'john_doe',
            'email': 'john@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'DifferentPass456!',
            'agree_terms': True
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == False
        assert 'confirm_password' in form.errors
    
    def test_registration_form_invalid_email(self):
        """Тест формы с некорректным email."""
        form_data = {
            'username': 'john_doe',
            'email': 'invalid-email',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'agree_terms': True
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == False
        assert 'email' in form.errors
    
    def test_registration_form_temp_email(self):
        """Тест формы с временным email."""
        form_data = {
            'username': 'john_doe',
            'email': 'test@tempmail.com',  # Временный email
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'agree_terms': True
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == False
        assert 'email' in form.errors
    
    def test_registration_form_reserved_username(self):
        """Тест формы с зарезервированным именем пользователя."""
        form_data = {
            'username': 'admin',  # Зарезервированное имя
            'email': 'john@example.com',
            'password': 'SecurePass123!',
            'confirm_password': 'SecurePass123!',
            'agree_terms': True
        }
        
        form = RegistrationForm(data=form_data)
        assert form.validate() == False
        assert 'username' in form.errors


class TestTransactionForm:
    """Тесты формы транзакции."""
    
    def test_valid_transaction_form(self):
        """Тест корректной формы транзакции."""
        form_data = {
            'amount': '150.75',
            'category_id': '1',
            'transaction_type': 'expense',
            'description': 'Grocery shopping',
            'date': date.today().strftime('%Y-%m-%d')
        }
        
        form = TransactionForm(data=form_data)
        # Добавляем выбор категорий для теста
        form.category_id.choices = [('1', 'Food'), ('2', 'Transport')]
        
        assert form.validate() == True
    
    def test_transaction_form_negative_amount(self):
        """Тест формы с отрицательной суммой."""
        form_data = {
            'amount': '-50',
            'category_id': '1',
            'transaction_type': 'expense',
            'date': date.today().strftime('%Y-%m-%d')
        }
        
        form = TransactionForm(data=form_data)
        form.category_id.choices = [('1', 'Food')]
        
        assert form.validate() == False
        assert 'amount' in form.errors
    
    def test_transaction_form_future_date(self):
        """Тест формы с датой в будущем."""
        future_date = (date.today() + timedelta(days=1)).strftime('%Y-%m-%d')
        form_data = {
            'amount': '100',
            'category_id': '1',
            'transaction_type': 'income',
            'date': future_date
        }
        
        form = TransactionForm(data=form_data)
        form.category_id.choices = [('1', 'Food')]
        
        assert form.validate() == False
        assert 'date' in form.errors
    
    def test_transaction_form_long_description(self):
        """Тест формы с слишком длинным описанием."""
        long_description = 'x' * 501  # 501 символ
        form_data = {
            'amount': '100',
            'category_id': '1',
            'transaction_type': 'income',
            'description': long_description,
            'date': date.today().strftime('%Y-%m-%d')
        }
        
        form = TransactionForm(data=form_data)
        form.category_id.choices = [('1', 'Food')]
        
        assert form.validate() == False
        assert 'description' in form.errors
    
    def test_transaction_form_missing_required(self):
        """Тест формы с отсутствующими обязательными полями."""
        form_data = {
            'amount': '',
            'category_id': '',
            'transaction_type': '',
            'date': ''
        }
        
        form = TransactionForm(data=form_data)
        assert form.validate() == False
        
        assert 'amount' in form.errors
        assert 'category_id' in form.errors
        assert 'transaction_type' in form.errors
        assert 'date' in form.errors


class TestCategoryForm:
    """Тесты формы категории."""
    
    def test_valid_category_form(self):
        """Тест корректной формы категории."""
        form_data = {
            'name': 'Groceries',
            'category_type': 'expense',
            'color': '#FF5733',
            'icon': 'fa-shopping-cart',
            'budget_limit': '500.00'
        }
        
        form = CategoryForm(data=form_data)
        assert form.validate() == True
    
    def test_category_form_invalid_color(self):
        """Тест формы с некорректным цветом."""
        form_data = {
            'name': 'Groceries',
            'category_type': 'expense',
            'color': 'not-a-color',  # Не HEX цвет
            'icon': 'fa-shopping-cart'
        }
        
        form = CategoryForm(data=form_data)
        assert form.validate() == False
        assert 'color' in form.errors
    
    def test_category_form_invalid_icon(self):
        """Тест формы с некорректной иконкой."""
        form_data = {
            'name': 'Groceries',
            'category_type': 'expense',
            'color': '#FF5733',
            'icon': 'invalid-icon-class'  # Не Font Awesome класс
        }
        
        form = CategoryForm(data=form_data)
        assert form.validate() == False
        assert 'icon' in form.errors
    
    def test_category_form_negative_budget(self):
        """Тест формы с отрицательным лимитом бюджета."""
        form_data = {
            'name': 'Groceries',
            'category_type': 'expense',
            'color': '#FF5733',
            'budget_limit': '-100'
        }
        
        form = CategoryForm(data=form_data)
        assert form.validate() == False
        assert 'budget_limit' in form.errors


class TestFilterForm:
    """Тесты формы фильтрации."""
    
    def test_valid_filter_form(self):
        """Тест корректной формы фильтрации."""
        form_data = {
            'start_date': (date.today() - timedelta(days=30)).strftime('%Y-%m-%d'),
            'end_date': date.today().strftime('%Y-%m-%d'),
            'category_id': '0',  # Все категории
            'transaction_type': 'all',
            'min_amount': '10',
            'max_amount': '1000',
            'search': 'grocery'
        }
        
        form = FilterForm(data=form_data)
        form.category_id.choices = [('0', 'Все категории'), ('1', 'Food')]
        
        assert form.validate() == True
    
    def test_filter_form_invalid_date_range(self):
        """Тест формы с некорректным диапазоном дат."""
        form_data = {
            'start_date': date.today().strftime('%Y-%m-%d'),
            'end_date': (date.today() - timedelta(days=30)).strftime('%Y-%m-%d'),  # Конец раньше начала
            'transaction_type': 'all'
        }
        
        form = FilterForm(data=form_data)
        assert form.validate() == False
        assert 'end_date' in form.errors
    
    def test_filter_form_invalid_amount_range(self):
        """Тест формы с некорректным диапазоном сумм."""
        form_data = {
            'min_amount': '1000',
            'max_amount': '100',  # Макс меньше мин
            'transaction_type': 'all'
        }
        
        form = FilterForm(data=form_data)
        assert form.validate() == False
        assert 'max_amount' in form.errors
    
    def test_filter_form_old_date(self):
        """Тест формы со слишком старой датой."""
        old_date = (date.today() - timedelta(days=365 * 10)).strftime('%Y-%m-%d')  # 10 лет назад
        form_data = {
            'start_date': old_date,
            'end_date': date.today().strftime('%Y-%m-%d'),
            'transaction_type': 'all'
        }
        
        form = FilterForm(data=form_data)
        assert form.validate() == False
        assert 'start_date' in form.errors


class TestValidators:
    """Тесты кастомных валидаторов."""
    
    @pytest.mark.parametrize('email,expected', [
        ('test@example.com', True),
        ('user.name@domain.co.uk', True),
        ('user+tag@example.org', True),
        ('invalid-email', False),
        ('user@', False),
        ('@domain.com', False),
        ('test@tempmail.com', False),  # Временный email
    ])
    def test_email_validator(self, email, expected):
        """Тест валидатора email."""
        validator = EmailValidator()
        
        class DummyForm:
            pass
        
        class DummyField:
            def __init__(self, data):
                self.data = data
        
        form = DummyForm()
        field = DummyField(email)
        
        if expected:
            validator(form, field)  # Не должно вызывать исключений
            assert True
        else:
            with pytest.raises(Exception):
                validator(form, field)
    
    @pytest.mark.parametrize('password,expected', [
        ('SecurePass123!', True),
        ('Short1!', False),  # Слишком короткий
        ('NoDigits!!', False),  # Без цифр
        ('12345678', False),  # Без букв
        ('password123', False),  # Без специальных символов
    ])
    def test_password_strength_validator(self, password, expected):
        """Тест валидатора силы пароля."""
        validator = PasswordStrengthValidator()
        
        class DummyForm:
            pass
        
        class DummyField:
            def __init__(self, data):
                self.data = data
        
        form = DummyForm()
        field = DummyField(password)
        
        if expected:
            validator(form, field)  # Не должно вызывать исключений
            assert True
        else:
            with pytest.raises(Exception):
                validator(form, field)
    
    @pytest.mark.parametrize('test_date,allow_today,expected', [
        (date.today() - timedelta(days=1), True, True),  # Вчера
        (date.today(), True, True),  # Сегодня, разрешено
        (date.today(), False, False),  # Сегодня, не разрешено
        (date.today() + timedelta(days=1), True, False),  # Завтра
    ])
    def test_future_date_validator(self, test_date, allow_today, expected):
        """Тест валидатора даты в будущем."""
        validator = FutureDateValidator(allow_today=allow_today)
        
        class DummyForm:
            pass
        
        class DummyField:
            def __init__(self, data):
                self.data = data
        
        form = DummyForm()
        field = DummyField(test_date)
        
        if expected:
            validator(form, field)  # Не должно вызывать исключений
            assert True
        else:
            with pytest.raises(Exception):
                validator(form, field)
    
    @pytest.mark.parametrize('amount,expected', [
        ('0.01', True),
        ('100.50', True),
        ('1000000', True),
        ('0', False),  # Меньше минимума
        ('-10', False),  # Отрицательное
        ('1000001', False),  # Больше максимума
        ('100.123', False),  >