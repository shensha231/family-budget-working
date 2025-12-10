"""
Главное Flask приложение для управления семейным бюджетом.
Поддерживает аутентификацию, транзакции, категории, отчеты и интернационализацию.
"""

import os
import logging
from datetime import datetime, date, timedelta
from decimal import Decimal

from flask import (
    Flask, render_template, redirect, url_for, flash, 
    request, session, g, jsonify, abort, make_response
)
from flask_login import (
    LoginManager, login_user, logout_user, 
    login_required, current_user
)
from flask_babel import Babel, gettext as _
from flask_wtf.csrf import CSRFProtect
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import HTTPException

# Импорты из наших модулей
from database import init_db, get_db, close_db_connection
from models import User, Transaction, Category
from forms import (
    RegistrationForm, LoginForm, TransactionForm,
    CategoryForm, FilterForm, ProfileForm, PasswordChangeForm
)
from utils import (
    hash_password, verify_password, format_currency,
    calculate_statistics, generate_monthly_report,
    validate_amount, sanitize_input
)
from config import get_config
from translations import i18n_manager, gettext, set_language
from validators import EmailValidator, PasswordStrengthValidator

# ============================================================================
# Конфигурация приложения
# ============================================================================

def create_app(config_name=None):
    """
    Фабрика для создания Flask приложения.
    
    Args:
        config_name (str): Имя конфигурации ('development', 'testing', 'production')
    
    Returns:
        Flask: Сконфигурированное приложение
    """
    app = Flask(__name__)
    
    # Загрузка конфигурации
    config = get_config(config_name)
    app.config.from_object(config)
    config.init_app(app)
    
    # Инициализация расширений
    csrf = CSRFProtect(app)
    login_manager = LoginManager()
    login_manager.init_app(app)
    babel = Babel(app)
    
    # Настройка логирования
    setup_logging(app)
    
    # Инициализация базы данных
    with app.app_context():
        init_db()
    
    # ========================================================================
    # Контекстные процессоры и фильтры шаблонов
    # ========================================================================
    
    @app.context_processor
    def inject_globals():
        """Добавление глобальных переменных во все шаблоны."""
        return {
            'current_year': datetime.now().year,
            'app_name': 'Family Budget',
            'version': '1.0.0',
            'current_user': current_user,
            'today': date.today(),
            'now': datetime.now(),
            '_': gettext,  # Функция перевода
            'format_currency': format_currency,
        }
    
    @app.template_filter('datetime')
    def format_datetime(value, format='medium'):
        """Фильтр для форматирования даты и времени в шаблонах."""
        if isinstance(value, str):
            value = datetime.fromisoformat(value.replace('Z', '+00:00'))
        
        if format == 'full':
            format_str = '%d %B %Y г. %H:%M'
        elif format == 'medium':
            format_str = '%d.%m.%Y %H:%M'
        else:
            format_str = '%d.%m.%Y'
        
        return value.strftime(format_str)
    
    @app.template_filter('currency')
    def currency_filter(amount, currency='RUB'):
        """Фильтр для форматирования валюты."""
        return format_currency(amount, currency)
    
    # ========================================================================
    # Обработчики ошибок
    # ========================================================================
    
    @app.errorhandler(404)
    def page_not_found(error):
        """Обработчик ошибки 404."""
        return render_template('errors/404.html'), 404
    
    @app.errorhandler(403)
    def forbidden(error):
        """Обработчик ошибки 403."""
        return render_template('errors/403.html'), 403
    
    @app.errorhandler(500)
    def internal_error(error):
        """Обработчик ошибки 500."""
        app.logger.error(f'500 Error: {error}')
        return render_template('errors/500.html'), 500
    
    @app.errorhandler(HTTPException)
    def handle_exception(error):
        """Обработчик всех HTTP исключений."""
        app.logger.error(f'HTTP Error {error.code}: {error.description}')
        return render_template('errors/generic.html', 
                             error=error), error.code
    
    # ========================================================================
    # Функции для работы с пользователями и аутентификацией
    # ========================================================================
    
    @login_manager.user_loader
    def load_user(user_id):
        """Загрузка пользователя для Flask-Login."""
        try:
            db = get_db()
            user_data = db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ).fetchone()
            
            if user_data:
                return User(
                    id=user_data['id'],
                    username=user_data['username'],
                    email=user_data['email'],
                    password_hash=user_data['password_hash'],
                    created_at=datetime.fromisoformat(user_data['created_at']) 
                    if user_data['created_at'] else None
                )
        except Exception as e:
            app.logger.error(f'Error loading user {user_id}: {e}')
        return None
    
    def get_current_user_id():
        """Получение ID текущего пользователя."""
        return current_user.id if current_user.is_authenticated else None
    
    # ========================================================================
    # Маршруты аутентификации
    # ========================================================================
    
    @app.route('/')
    def index():
        """Главная страница."""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        return render_template('index.html')
    
    @app.route('/register', methods=['GET', 'POST'])
    def register():
        """Страница регистрации."""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        
        form = RegistrationForm()
        
        if form.validate_on_submit():
            try:
                db = get_db()
                
                # Проверка уникальности email
                existing_user = db.execute(
                    'SELECT id FROM users WHERE email = ?', 
                    (form.email.data,)
                ).fetchone()
                
                if existing_user:
                    flash(_('Пользователь с таким email уже существует'), 'danger')
                    return render_template('auth/register.html', form=form)
                
                # Проверка уникальности имени пользователя
                existing_username = db.execute(
                    'SELECT id FROM users WHERE username = ?', 
                    (form.username.data,)
                ).fetchone()
                
                if existing_username:
                    flash(_('Имя пользователя уже занято'), 'danger')
                    return render_template('auth/register.html', form=form)
                
                # Хеширование пароля
                password_hash = hash_password(form.password.data)
                
                # Создание пользователя
                db.execute(
                    '''INSERT INTO users (username, email, password_hash) 
                       VALUES (?, ?, ?)''',
                    (form.username.data, form.email.data, password_hash)
                )
                db.commit()
                
                flash(_('Регистрация успешна! Теперь войдите в систему.'), 'success')
                return redirect(url_for('login'))
                
            except Exception as e:
                app.logger.error(f'Registration error: {e}')
                flash(_('Ошибка при регистрации. Попробуйте позже.'), 'danger')
        
        return render_template('auth/register.html', form=form)
    
    @app.route('/login', methods=['GET', 'POST'])
    def login():
        """Страница входа."""
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        
        form = LoginForm()
        
        if form.validate_on_submit():
            try:
                db = get_db()
                user_data = db.execute(
                    'SELECT * FROM users WHERE email = ?', 
                    (form.email.data,)
                ).fetchone()
                
                if user_data and verify_password(form.password.data, user_data['password_hash']):
                    user = User(
                        id=user_data['id'],
                        username=user_data['username'],
                        email=user_data['email'],
                        password_hash=user_data['password_hash'],
                        created_at=datetime.fromisoformat(user_data['created_at']) 
                        if user_data['created_at'] else None
                    )
                    
                    login_user(user, remember=form.remember.data)
                    flash(_('Вход выполнен успешно!'), 'success')
                    
                    next_page = request.args.get('next')
                    return redirect(next_page or url_for('dashboard'))
                else:
                    flash(_('Неверный email или пароль'), 'danger')
                    
            except Exception as e:
                app.logger.error(f'Login error: {e}')
                flash(_('Ошибка при входе в систему'), 'danger')
        
        return render_template('auth/login.html', form=form)
    
    @app.route('/logout')
    @login_required
    def logout():
        """Выход из системы."""
        logout_user()
        flash(_('Вы вышли из системы'), 'info')
        return redirect(url_for('index'))
    
    # ========================================================================
    # Маршруты панели управления
    # ========================================================================
    
    @app.route('/dashboard')
    @login_required
    def dashboard():
        """Панель управления."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Получение статистики
            stats = calculate_statistics(user_id, db)
            
            # Последние транзакции
            recent_transactions = db.execute('''
                SELECT t.*, c.name as category_name, c.color as category_color
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
                ORDER BY t.date DESC, t.created_at DESC
                LIMIT 10
            ''', (user_id,)).fetchall()
            
            # Категории для быстрой транзакции
            categories = db.execute(
                'SELECT id, name, type FROM categories WHERE user_id = ? ORDER BY name',
                (user_id,)
            ).fetchall()
            
            return render_template('dashboard.html',
                                 stats=stats,
                                 recent_transactions=recent_transactions,
                                 categories=categories)
            
        except Exception as e:
            app.logger.error(f'Dashboard error: {e}')
            flash(_('Ошибка при загрузке данных'), 'danger')
            return render_template('dashboard.html', stats={}, recent_transactions=[])
    
    # ========================================================================
    # Маршруты транзакций
    # ========================================================================
    
    @app.route('/transactions')
    @login_required
    def transactions():
        """Страница списка транзакций."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Параметры фильтрации
            page = request.args.get('page', 1, type=int)
            per_page = 20
            offset = (page - 1) * per_page
            
            # Форма фильтров
            filter_form = FilterForm(request.args, user_id=user_id)
            
            # Базовый запрос
            query = '''
                SELECT t.*, c.name as category_name, c.color as category_color
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
            '''
            params = [user_id]
            
            # Применение фильтров
            if filter_form.validate():
                if filter_form.start_date.data:
                    query += ' AND t.date >= ?'
                    params.append(filter_form.start_date.data)
                
                if filter_form.end_date.data:
                    query += ' AND t.date <= ?'
                    params.append(filter_form.end_date.data)
                
                if filter_form.category_id.data and filter_form.category_id.data != '0':
                    query += ' AND t.category_id = ?'
                    params.append(filter_form.category_id.data)
                
                if filter_form.transaction_type.data != 'all':
                    query += ' AND t.type = ?'
                    params.append(filter_form.transaction_type.data)
                
                if filter_form.search.data:
                    query += ' AND t.description LIKE ?'
                    params.append(f'%{filter_form.search.data}%')
            
            # Сортировка и пагинация
            query += ' ORDER BY t.date DESC, t.created_at DESC LIMIT ? OFFSET ?'
            params.extend([per_page, offset])
            
            transactions_list = db.execute(query, params).fetchall()
            
            # Общее количество для пагинации
            count_query = 'SELECT COUNT(*) as total FROM transactions WHERE user_id = ?'
            count_params = [user_id]
            
            # TODO: Применить те же фильтры к count_query
            
            total = db.execute(count_query, count_params).fetchone()['total']
            total_pages = (total + per_page - 1) // per_page
            
            # Категории для формы добавления
            categories = db.execute(
                'SELECT id, name, type FROM categories WHERE user_id = ? ORDER BY name',
                (user_id,)
            ).fetchall()
            
            # Форма для добавления транзакции
            transaction_form = TransactionForm(user_id=user_id)
            transaction_form.category_id.choices = [(cat['id'], cat['name']) for cat in categories]
            
            return render_template('transactions/list.html',
                                 transactions=transactions_list,
                                 form=transaction_form,
                                 filter_form=filter_form,
                                 page=page,
                                 total_pages=total_pages)
            
        except Exception as e:
            app.logger.error(f'Transactions list error: {e}')
            flash(_('Ошибка при загрузке транзакций'), 'danger')
            return render_template('transactions/list.html', transactions=[])
    
    @app.route('/transaction/add', methods=['POST'])
    @login_required
    def add_transaction():
        """Добавление новой транзакции."""
        try:
            user_id = get_current_user_id()
            form = TransactionForm(request.form, user_id=user_id)
            
            if form.validate():
                db = get_db()
                
                # Валидация суммы
                if not validate_amount(form.amount.data):
                    flash(_('Некорректная сумма'), 'danger')
                    return redirect(url_for('transactions'))
                
                # Добавление транзакции
                db.execute('''
                    INSERT INTO transactions 
                    (amount, description, type, date, user_id, category_id)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    form.amount.data,
                    sanitize_input(form.description.data) if form.description.data else None,
                    form.transaction_type.data,
                    form.date.data,
                    user_id,
                    form.category_id.data if form.category_id.data != '0' else None
                ))
                db.commit()
                
                flash(_('Транзакция успешно добавлена'), 'success')
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        flash(f'{getattr(form, field).label.text}: {error}', 'danger')
            
        except Exception as e:
            app.logger.error(f'Add transaction error: {e}')
            flash(_('Ошибка при добавлении транзакции'), 'danger')
        
        return redirect(url_for('transactions'))
    
    @app.route('/transaction/<int:transaction_id>/edit', methods=['GET', 'POST'])
    @login_required
    def edit_transaction(transaction_id):
        """Редактирование транзакции."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Получение транзакции
            transaction = db.execute('''
                SELECT * FROM transactions 
                WHERE id = ? AND user_id = ?
            ''', (transaction_id, user_id)).fetchone()
            
            if not transaction:
                flash(_('Транзакция не найдена'), 'danger')
                return redirect(url_for('transactions'))
            
            # Получение категорий пользователя
            categories = db.execute(
                'SELECT id, name FROM categories WHERE user_id = ? ORDER BY name',
                (user_id,)
            ).fetchall()
            
            if request.method == 'GET':
                # Заполнение формы данными транзакции
                form = TransactionForm(
                    amount=transaction['amount'],
                    description=transaction['description'],
                    transaction_type=transaction['type'],
                    date=datetime.strptime(transaction['date'], '%Y-%m-%d').date()
                    if isinstance(transaction['date'], str) else transaction['date'],
                    category_id=transaction['category_id']
                )
                form.category_id.choices = [(cat['id'], cat['name']) for cat in categories]
            else:
                # Обработка формы
                form = TransactionForm(request.form, user_id=user_id)
                form.category_id.choices = [(cat['id'], cat['name']) for cat in categories]
                
                if form.validate():
                    db.execute('''
                        UPDATE transactions 
                        SET amount = ?, description = ?, type = ?, 
                            date = ?, category_id = ?
                        WHERE id = ? AND user_id = ?
                    ''', (
                        form.amount.data,
                        sanitize_input(form.description.data) if form.description.data else None,
                        form.transaction_type.data,
                        form.date.data,
                        form.category_id.data if form.category_id.data != '0' else None,
                        transaction_id,
                        user_id
                    ))
                    db.commit()
                    
                    flash(_('Транзакция успешно обновлена'), 'success')
                    return redirect(url_for('transactions'))
            
            return render_template('transactions/edit.html', 
                                 form=form, 
                                 transaction_id=transaction_id)
            
        except Exception as e:
            app.logger.error(f'Edit transaction error: {e}')
            flash(_('Ошибка при редактировании транзакции'), 'danger')
            return redirect(url_for('transactions'))
    
    @app.route('/transaction/<int:transaction_id>/delete', methods=['POST'])
    @login_required
    def delete_transaction(transaction_id):
        """Удаление транзакции."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Проверка существования транзакции
            transaction = db.execute(
                'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
                (transaction_id, user_id)
            ).fetchone()
            
            if transaction:
                db.execute(
                    'DELETE FROM transactions WHERE id = ? AND user_id = ?',
                    (transaction_id, user_id)
                )
                db.commit()
                flash(_('Транзакция успешно удалена'), 'success')
            else:
                flash(_('Транзакция не найдена'), 'danger')
                
        except Exception as e:
            app.logger.error(f'Delete transaction error: {e}')
            flash(_('Ошибка при удалении транзакции'), 'danger')
        
        return redirect(url_for('transactions'))
    
    # ========================================================================
    # Маршруты категорий
    # ========================================================================
    
    @app.route('/categories')
    @login_required
    def categories():
        """Страница управления категориями."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Получение категорий пользователя
            categories_list = db.execute('''
                SELECT * FROM categories 
                WHERE user_id = ? 
                ORDER BY type, name
            ''', (user_id,)).fetchall()
            
            # Статистика по категориям
            category_stats = {}
            for category in categories_list:
                stats = db.execute('''
                    SELECT 
                        COUNT(*) as count,
                        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                    FROM transactions 
                    WHERE category_id = ? AND user_id = ?
                ''', (category['id'], user_id)).fetchone()
                
                category_stats[category['id']] = stats
            
            # Форма для добавления категории
            form = CategoryForm()
            
            return render_template('categories/list.html',
                                 categories=categories_list,
                                 category_stats=category_stats,
                                 form=form)
            
        except Exception as e:
            app.logger.error(f'Categories list error: {e}')
            flash(_('Ошибка при загрузке категорий'), 'danger')
            return render_template('categories/list.html', categories=[])
    
    @app.route('/category/add', methods=['POST'])
    @login_required
    def add_category():
        """Добавление новой категории."""
        try:
            user_id = get_current_user_id()
            form = CategoryForm(request.form)
            
            if form.validate():
                db = get_db()
                
                # Проверка уникальности имени категории для пользователя
                existing = db.execute(
                    'SELECT id FROM categories WHERE name = ? AND user_id = ?',
                    (form.name.data, user_id)
                ).fetchone()
                
                if existing:
                    flash(_('Категория с таким названием уже существует'), 'danger')
                else:
                    # Добавление категории
                    db.execute('''
                        INSERT INTO categories 
                        (name, type, user_id, color, icon, budget_limit)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        form.name.data,
                        form.category_type.data,
                        user_id,
                        form.color.data,
                        form.icon.data or 'fa-folder',
                        form.budget_limit.data if form.budget_limit.data else None
                    ))
                    db.commit()
                    
                    flash(_('Категория успешно добавлена'), 'success')
            else:
                for field, errors in form.errors.items():
                    for error in errors:
                        flash(f'{getattr(form, field).label.text}: {error}', 'danger')
            
        except Exception as e:
            app.logger.error(f'Add category error: {e}')
            flash(_('Ошибка при добавлении категории'), 'danger')
        
        return redirect(url_for('categories'))
    
    @app.route('/category/<int:category_id>/edit', methods=['GET', 'POST'])
    @login_required
    def edit_category(category_id):
        """Редактирование категории."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Получение категории
            category = db.execute(
                'SELECT * FROM categories WHERE id = ? AND user_id = ?',
                (category_id, user_id)
            ).fetchone()
            
            if not category:
                flash(_('Категория не найдена'), 'danger')
                return redirect(url_for('categories'))
            
            if request.method == 'GET':
                # Заполнение формы данными категории
                form = CategoryForm(
                    name=category['name'],
                    category_type=category['type'],
                    color=category['color'],
                    icon=category['icon'],
                    budget_limit=category['budget_limit']
                )
            else:
                # Обработка формы
                form = CategoryForm(request.form)
                
                if form.validate():
                    # Проверка уникальности имени (исключая текущую категорию)
                    existing = db.execute(
                        '''SELECT id FROM categories 
                           WHERE name = ? AND user_id = ? AND id != ?''',
                        (form.name.data, user_id, category_id)
                    ).fetchone()
                    
                    if existing:
                        flash(_('Категория с таким названием уже существует'), 'danger')
                    else:
                        # Обновление категории
                        db.execute('''
                            UPDATE categories 
                            SET name = ?, type = ?, color = ?, 
                                icon = ?, budget_limit = ?
                            WHERE id = ? AND user_id = ?
                        ''', (
                            form.name.data,
                            form.category_type.data,
                            form.color.data,
                            form.icon.data or 'fa-folder',
                            form.budget_limit.data if form.budget_limit.data else None,
                            category_id,
                            user_id
                        ))
                        db.commit()
                        
                        flash(_('Категория успешно обновлена'), 'success')
                        return redirect(url_for('categories'))
            
            return render_template('categories/edit.html', 
                                 form=form, 
                                 category_id=category_id)
            
        except Exception as e:
            app.logger.error(f'Edit category error: {e}')
            flash(_('Ошибка при редактировании категории'), 'danger')
            return redirect(url_for('categories'))
    
    @app.route('/category/<int:category_id>/delete', methods=['POST'])
    @login_required
    def delete_category(category_id):
        """Удаление категории."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Проверка существования категории
            category = db.execute(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                (category_id, user_id)
            ).fetchone()
            
            if category:
                # Проверка, нет ли связанных транзакций
                transactions_count = db.execute(
                    'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?',
                    (category_id,)
                ).fetchone()['count']
                
                if transactions_count > 0:
                    flash(_('Нельзя удалить категорию, к которой привязаны транзакции'), 'danger')
                else:
                    db.execute(
                        'DELETE FROM categories WHERE id = ? AND user_id = ?',
                        (category_id, user_id)
                    )
                    db.commit()
                    flash(_('Категория успешно удалена'), 'success')
            else:
                flash(_('Категория не найдена'), 'danger')
                
        except Exception as e:
            app.logger.error(f'Delete category error: {e}')
            flash(_('Ошибка при удалении категории'), 'danger')
        
        return redirect(url_for('categories'))
    
    # ========================================================================
    # Маршруты отчетов
    # ========================================================================
    
    @app.route('/reports')
    @login_required
    def reports():
        """Страница отчетов."""
        try:
            user_id = get_current_user_id()
            
            # Параметры по умолчанию
            start_date = request.args.get('start_date', 
                                         (date.today().replace(day=1)).isoformat())
            end_date = request.args.get('end_date', date.today().isoformat())
            
            # Форма фильтров
            filter_form = FilterForm(
                start_date=datetime.strptime(start_date, '%Y-%m-%d').date(),
                end_date=datetime.strptime(end_date, '%Y-%m-%d').date(),
                user_id=user_id
            )
            
            # Генерация отчетов
            db = get_db()
            monthly_report = generate_monthly_report(user_id, start_date, end_date, db)
            
            return render_template('reports/index.html',
                                 filter_form=filter_form,
                                 monthly_report=monthly_report,
                                 start_date=start_date,
                                 end_date=end_date)
            
        except Exception as e:
            app.logger.error(f'Reports error: {e}')
            flash(_('Ошибка при генерации отчетов'), 'danger')
            return render_template('reports/index.html')
    
    @app.route('/report/export')
    @login_required
    def export_report():
        """Экспорт отчета в CSV."""
        try:
            user_id = get_current_user_id()
            format_type = request.args.get('format', 'csv')
            start_date = request.args.get('start_date')
            end_date = request.args.get('end_date')
            
            db = get_db()
            
            # Получение данных
            query = '''
                SELECT t.date, t.amount, t.type, t.description, c.name as category
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ?
            '''
            params = [user_id]
            
            if start_date:
                query += ' AND t.date >= ?'
                params.append(start_date)
            
            if end_date:
                query += ' AND t.date <= ?'
                params.append(end_date)
            
            query += ' ORDER BY t.date DESC'
            transactions = db.execute(query, params).fetchall()
            
            # Генерация CSV
            if format_type == 'csv':
                import csv
                import io
                
                output = io.StringIO()
                writer = csv.writer(output)
                
                # Заголовки
                writer.writerow(['Дата', 'Сумма', 'Тип', 'Категория', 'Описание'])
                
                # Данные
                for t in transactions:
                    writer.writerow([
                        t['date'],
                        t['amount'],
                        _('Доход') if t['type'] == 'income' else _('Расход'),
                        t['category'] or '',
                        t['description'] or ''
                    ])
                
                # Создание ответа
                response = make_response(output.getvalue())
                response.headers['Content-Disposition'] = \
                    f'attachment; filename=transactions_{date.today()}.csv'
                response.headers['Content-type'] = 'text/csv'
                
                return response
            
            else:
                flash(_('Неподдерживаемый формат экспорта'), 'danger')
                return redirect(url_for('reports'))
                
        except Exception as e:
            app.logger.error(f'Export report error: {e}')
            flash(_('Ошибка при экспорте отчета'), 'danger')
            return redirect(url_for('reports'))
    
    # ========================================================================
    # Маршруты профиля и настроек
    # ========================================================================
    
    @app.route('/profile', methods=['GET', 'POST'])
    @login_required
    def profile():
        """Страница профиля пользователя."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            # Получение данных пользователя
            user_data = db.execute(
                'SELECT * FROM users WHERE id = ?', (user_id,)
            ).fetchone()
            
            if request.method == 'GET':
                form = ProfileForm(
                    username=user_data['username'],
                    email=user_data['email']
                )
            else:
                form = ProfileForm(request.form)
                
                if form.validate():
                    # Проверка уникальности email
                    if form.email.data != user_data['email']:
                        existing = db.execute(
                            'SELECT id FROM users WHERE email = ? AND id != ?',
                            (form.email.data, user_id)
                        ).fetchone()
                        
                        if existing:
                            flash(_('Email уже используется другим пользователем'), 'danger')
                            return render_template('profile/index.html', form=form)
                    
                    # Проверка уникальности имени пользователя
                    if form.username.data != user_data['username']:
                        existing = db.execute(
                            'SELECT id FROM users WHERE username = ? AND id != ?',
                            (form.username.data, user_id)
                        ).fetchone()
                        
                        if existing:
                            flash(_('Имя пользователя уже занято'), 'danger')
                            return render_template('profile/index.html', form=form)
                    
                    # Обновление профиля
                    db.execute('''
                        UPDATE users 
                        SET username = ?, email = ?
                        WHERE id = ?
                    ''', (form.username.data, form.email.data, user_id))
                    db.commit()
                    
                    flash(_('Профиль успешно обновлен'), 'success')
                    return redirect(url_for('profile'))
            
            return render_template('profile/index.html', form=form)
            
        except Exception as e:
            app.logger.error(f'Profile error: {e}')
            flash(_('Ошибка при обновлении профиля'), 'danger')
            return render_template('profile/index.html', form=ProfileForm())
    
    @app.route('/settings')
    @login_required
    def settings():
        """Страница настроек."""
        return render_template('settings/index.html')
    
    # ========================================================================
    # API маршруты (для AJAX запросов)
    # ========================================================================
    
    @app.route('/api/statistics')
    @login_required
    def api_statistics():
        """API для получения статистики."""
        try:
            user_id = get_current_user_id()
            db = get_db()
            
            stats = calculate_statistics(user_id, db)
            return jsonify({
                'success': True,
                'data': stats
            })
            
        except Exception as e:
            app.logger.error(f'API statistics error: {e}')
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    @app.route('/api/transactions/chart')
    @login_required
    def api_transactions_chart():
        """API для данных графика транзакций."""
        try:
            user_id = get_current_user_id()
            period = request.args.get('period', 'month')
            db = get_db()
            
            # Определение периода
            if period == 'month':
                start_date = date.today().replace(day=1)
                group_by = 'DATE(date)'
            elif period == 'year':
                start_date = date.today().replace(month=1, day=1)
                group_by = 'MONTH(date)'
            else:
                start_date = date.today() - timedelta(days=30)
                group_by = 'DATE(date)'
            
            # Данные для графика
            chart_data = db.execute(f'''
                SELECT 
                    {group_by} as period,
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
                FROM transactions
                WHERE user_id = ? AND date >= ?
                GROUP BY {group_by}
                ORDER BY period
            ''', (user_id, start_date.isoformat())).fetchall()
            
            return jsonify({
                'success': True,
                'data': [dict(row) for row in chart_data]
            })
            
        except Exception as e:
            app.logger.error(f'API chart error: {e}')
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500
    
    # ========================================================================
    # Вспомогательные маршруты
    # ========================================================================
    
    @app.route('/health')
    def health_check():
        """Проверка здоровья приложения."""
        try:
            db = get_db()
            db.execute('SELECT 1')
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0'
            })
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'error': str(e)
            }), 500
    
    @app.route('/set-language/<lang>')
    def set_language_route(lang):
        """Установка языка интерфейса."""
        if set_language(lang):
            flash(_('Язык изменен'), 'success')
        else:
            flash(_('Неподдерживаемый язык'), 'danger')
        
        return redirect(request.referrer or url_for('index'))
    
    # ========================================================================
    # Обработчики событий
    # ========================================================================
    
    @app.before_request
    def before_request():
        """Выполняется перед каждым запросом."""
        g.db = get_db()
        g.start_time = datetime.now()
        
        # Логирование запроса
        if app.debug:
            app.logger.debug(f'Request: {request.method} {request.path}')
    
    @app.after_request
    def after_request(response):
        """Выполняется после каждого запроса."""
        # Закрытие соединения с БД
        close_db_connection()
        
        # Логирование времени выполнения
        if hasattr(g, 'start_time'):
            duration = (datetime.now() - g.start_time).total_seconds()
            if app.debug and duration > 0.1:  # Логируем только медленные запросы
                app.logger.debug(f'Request took {duration:.3f}s: {request.method} {request.path}')
        
        return response
    
    @app.teardown_request
    def teardown_request(exception=None):
        """Выполняется после обработки запроса (даже при ошибках)."""
        close_db_connection()
    
    return app


def setup_logging(app):
    """Настройка логирования для приложения."""
    if not app.debug:
        # Создаем папку для логов
        log_dir = 'logs'
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Настройка файлового хендлера
        file_handler = logging.FileHandler(f'{log_dir}/family_budget.log')
        file_handler.setLevel(logging.WARNING)
        
        # Формат логов
        formatter = logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
        )
        file_handler.setFormatter(formatter)
        
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)


# ============================================================================
# Точка входа в приложение
# ============================================================================

# Создаем приложение с конфигурацией для разработки
app = create_app('development')

if __name__ == '__main__':
    print("=" * 60)
    print("СЕМЕЙНЫЙ БЮДЖЕТ - ВЕБ-ПРИЛОЖЕНИЕ")
    print("=" * 60)
    print(f"Запуск в режиме: {'РАЗРАБОТКИ' if app.debug else 'ПРОДАКШЕН'}")
    print(f"Папка проекта: {os.getcwd()}")
    print(f"База данных: {app.config.get('DATABASE_PATH', 'family_finance.db')}")
    print("=" * 60)
    
    # Запуск Flask сервера
    app.run(
        host=app.config.get('HOST', '127.0.0.1'),
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', True),
        threaded=True
    )