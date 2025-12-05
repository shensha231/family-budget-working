"""
Конфигурация тестовой среды для приложения управления финансами.
"""

import os
import tempfile
import pytest
from datetime import date, timedelta

from main import app as flask_app
from database import init_db, get_db
from models import User, Category, Transaction
from utils import hash_password


@pytest.fixture
def app():
    """
    Создание тестового приложения Flask.
    
    Returns:
        Flask: Тестовое приложение
    """
    # Создаем временную базу данных
    db_fd, db_path = tempfile.mkstemp()
    
    flask_app.config.update({
        'TESTING': True,
        'DATABASE_PATH': db_path,
        'WTF_CSRF_ENABLED': False,  # Отключаем CSRF для тестов
        'SECRET_KEY': 'test-secret-key',
    })
    
    # Создаем базу данных и таблицы
    with flask_app.app_context():
        init_db()
    
    yield flask_app
    
    # Закрываем и удаляем временную БД
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture
def client(app):
    """
    Тестовый клиент для отправки запросов.
    
    Args:
        app: Тестовое приложение
    
    Returns:
        FlaskClient: Тестовый клиент
    """
    return app.test_client()


@pytest.fixture
def runner(app):
    """
    Тестовый runner для CLI команд.
    
    Args:
        app: Тестовое приложение
    
    Returns:
        FlaskCliRunner: CLI runner
    """
    return app.test_cli_runner()


class AuthActions:
    """
    Класс для работы с аутентификацией в тестах.
    """
    
    def __init__(self, client):
        self._client = client
    
    def login(self, email='test@example.com', password='testpassword123'):
        """
        Вход пользователя в систему.
        
        Args:
            email (str): Email пользователя
            password (str): Пароль пользователя
        
        Returns:
            Response: Ответ от сервера
        """
        return self._client.post('/login', data={
            'email': email,
            'password': password,
            'remember': False
        })
    
    def logout(self):
        """
        Выход пользователя из системы.
        
        Returns:
            Response: Ответ от сервера
        """
        return self._client.get('/logout')


@pytest.fixture
def auth(client):
    """
    Фикстура для работы с аутентификацией.
    
    Args:
        client: Тестовый клиент
    
    Returns:
        AuthActions: Объект для работы с аутентификацией
    """
    return AuthActions(client)


@pytest.fixture
def test_user():
    """
    Создание тестового пользователя.
    
    Returns:
        User: Тестовый пользователь
    """
    user = User(
        username='testuser',
        email='test@example.com',
        password_hash=hash_password('testpassword123')
    )
    return user


@pytest.fixture
def test_category(test_user):
    """
    Создание тестовой категории.
    
    Args:
        test_user: Тестовый пользователь
    
    Returns:
        Category: Тестовая категория
    """
    category = Category(
        name='Test Category',
        category_type='expense',
        user_id=test_user.id,
        color='#FF0000',
        icon='fa-test'
    )
    return category


@pytest.fixture
def test_transaction(test_user, test_category):
    """
    Создание тестовой транзакции.
    
    Args:
        test_user: Тестовый пользователь
        test_category: Тестовая категория
    
    Returns:
        Transaction: Тестовая транзакция
    """
    transaction = Transaction(
        amount=100.50,
        description='Test transaction',
        transaction_type='expense',
        date=date.today(),
        user_id=test_user.id,
        category_id=test_category.id
    )
    return transaction


@pytest.fixture
def db_session(app, test_user, test_category, test_transaction):
    """
    Создание тестовой сессии БД с данными.
    
    Args:
        app: Тестовое приложение
        test_user: Тестовый пользователь
        test_category: Тестовая категория
        test_transaction: Тестовая транзакция
    
    Yields:
        Session: Сессия БД
    """
    with app.app_context():
        db = get_db()
        
        # Очищаем таблицы
        db.execute('DELETE FROM transactions')
        db.execute('DELETE FROM categories')
        db.execute('DELETE FROM users')
        db.commit()
        
        # Добавляем тестового пользователя
        db.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (test_user.username, test_user.email, test_user.password_hash)
        )
        db.commit()
        
        # Получаем ID созданного пользователя
        user_row = db.execute(
            'SELECT id FROM users WHERE email = ?',
            (test_user.email,)
        ).fetchone()
        user_id = user_row['id']
        
        # Добавляем тестовую категорию
        db.execute(
            '''INSERT INTO categories 
               (name, type, user_id, color, icon) 
               VALUES (?, ?, ?, ?, ?)''',
            (test_category.name, test_category.category_type, 
             user_id, test_category.color, test_category.icon)
        )
        db.commit()
        
        # Получаем ID созданной категории
        category_row = db.execute(
            'SELECT id FROM categories WHERE name = ?',
            (test_category.name,)
        ).fetchone()
        category_id = category_row['id']
        
        # Добавляем тестовую транзакцию
        db.execute(
            '''INSERT INTO transactions 
               (amount, description, type, date, user_id, category_id) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            (test_transaction.amount, test_transaction.description,
             test_transaction.transaction_type, test_transaction.date,
             user_id, category_id)
        )
        db.commit()
        
        yield db
        
        # Очистка после теста
        db.execute('DELETE FROM transactions')
        db.execute('DELETE FROM categories')
        db.execute('DELETE FROM users')
        db.commit()


@pytest.fixture
def sample_transactions(db_session, test_user):
    """
    Создание набора тестовых транзакций для статистических тестов.
    
    Args:
        db_session: Сессия БД
        test_user: Тестовый пользователь
    
    Returns:
        list: Список созданных транзакций
    """
    user_row = db_session.execute(
        'SELECT id FROM users WHERE email = ?',
        (test_user.email,)
    ).fetchone()
    user_id = user_row['id']
    
    category_row = db_session.execute(
        'SELECT id FROM categories WHERE name = ?',
        ('Test Category',)
    ).fetchone()
    category_id = category_row['id']
    
    # Создаем разнообразные транзакции
    transactions_data = [
        (150.75, 'Salary', 'income', date.today() - timedelta(days=5), user_id, category_id),
        (45.30, 'Groceries', 'expense', date.today() - timedelta(days=4), user_id, category_id),
        (25.00, 'Coffee', 'expense', date.today() - timedelta(days=3), user_id, category_id),
        (300.00, 'Freelance', 'income', date.today() - timedelta(days=2), user_id, category_id),
        (80.50, 'Restaurant', 'expense', date.today() - timedelta(days=1), user_id, category_id),
    ]
    
    transactions = []
    for amount, description, trans_type, trans_date, user_id, category_id in transactions_data:
        db_session.execute(
            '''INSERT INTO transactions 
               (amount, description, type, date, user_id, category_id) 
               VALUES (?, ?, ?, ?, ?, ?)''',
            (amount, description, trans_type, trans_date, user_id, category_id)
        )
        transactions.append({
            'amount': amount,
            'description': description,
            'type': trans_type,
            'date': trans_date
        })
    
    db_session.commit()
    return transactions