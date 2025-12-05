import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">💰</div>
              <span className="logo-text">FamilyBudget</span>
            </div>
            <p className="footer-description">
              Умное управление семейными финансами. 
              Контролируйте бюджет, планируйте цели и достигайте финансовой свободы вместе.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Telegram">
                📱
              </a>
              <a href="#" className="social-link" aria-label="VK">
                👥
              </a>
              <a href="#" className="social-link" aria-label="Email">
                📧
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Навигация</h4>
            <ul className="footer-links">
              <li><a href="/">Дашборд</a></li>
              <li><a href="/operations">Операции</a></li>
              <li><a href="/analysis">Анализ</a></li>
              <li><a href="/family">Семья</a></li>
              <li><a href="/formulas">Формулы</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Инструменты</h4>
            <ul className="footer-links">
              <li><a href="/simulator">Симулятор</a></li>
              <li><a href="/advice">Советы</a></li>
              <li><a href="/settings">Настройки</a></li>
              <li><a href="#">Отчеты</a></li>
              <li><a href="#">Цели</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Поддержка</h4>
            <ul className="footer-links">
              <li><a href="#">Помощь</a></li>
              <li><a href="#">Документация</a></li>
              <li><a href="#">Контакты</a></li>
              <li><a href="#">Обратная связь</a></li>
              <li><a href="#">Статус системы</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {currentYear} FamilyBudget. Все права защищены.
          </div>
          <div className="footer-legal">
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Условия использования</a>
            <a href="#">Cookie</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;