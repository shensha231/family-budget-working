import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Дашборд', path: '/', icon: '📊' },
    { name: 'Операции', path: '/operations', icon: '💸' },
    { name: 'Анализ', path: '/analysis', icon: '📈' },
    { name: 'Формулы', path: '/formulas', icon: '🧮' },
    { name: 'Симулятор', path: '/simulator', icon: '🎮' },
    { name: 'Советы', path: '/advice', icon: '💡' },
    { name: 'Семья', path: '/family', icon: '👨‍👩‍👧‍👦' },
    { name: 'Настройки', path: '/settings', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">💰</div>
          <span className="logo-text">FamilyBudget</span>
        </Link>

        <nav className="nav-desktop">
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Переключить тему"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.name}</span>
              <button 
                className="logout-btn"
                onClick={handleLogout}
                title="Выйти"
              >
                🚪
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Войти
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/register')}>
                Регистрация
              </button>
            </div>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            ☰
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;