import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFamily } from '../contexts/FamilyContext';
import './Settings.css';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { family } = useFamily();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'preferences' | 'security'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    notifications: true,
    language: 'ru'
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика обновления профиля
    alert('Профиль успешно обновлен!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    // Здесь будет логика смены пароля
    alert('Пароль успешно изменен!');
    setSecurityData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const exportData = () => {
    const data = {
      user: profileData,
      family: family,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `family-budget-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Здесь будет логика импорта данных
        alert('Данные успешно импортированы!');
      } catch (error) {
        alert('Ошибка при импорте данных!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Настройки ⚙️</h1>
        <p>Управление настройками приложения и профилем</p>
      </div>

      <div className="settings-layout">
        {/* Боковая панель навигации */}
        <div className="settings-sidebar">
          <button 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Профиль
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'family' ? 'active' : ''}`}
            onClick={() => setActiveTab('family')}
          >
            👨‍👩‍👧‍👦 Семья
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            🎨 Внешний вид
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔐 Безопасность
          </button>
        </div>

        {/* Основной контент */}
        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Профиль пользователя</h2>
              <form onSubmit={handleProfileUpdate} className="settings-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Имя</label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      placeholder="Введите ваше имя"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+7 (999) 999-99-99"
                  />
                </div>

                <div className="form-group">
                  <label>Язык</label>
                  <select
                    value={profileData.language}
                    onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Уведомления</h4>
                    <p>Получать уведомления о новых операциях и отчетах</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={profileData.notifications}
                      onChange={(e) => setProfileData({...profileData, notifications: e.target.checked})}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Сохранить изменения
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="settings-section">
              <h2>Настройки семьи</h2>
              
              <div className="family-info">
                <div className="info-card">
                  <h4>Текущая семья</h4>
                  <p>{family?.name || 'Семья не выбрана'}</p>
                </div>
                
                <div className="info-card">
                  <h4>Участников</h4>
                  <p>{family?.members?.length || 0} человек</p>
                </div>
                
                <div className="info-card">
                  <h4>Бюджет</h4>
                  <p>₽{(family?.budget || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="data-management">
                <h4>Управление данными</h4>
                <div className="data-actions">
                  <button className="btn btn-secondary" onClick={exportData}>
                    📥 Экспорт данных
                  </button>
                  <label className="btn btn-secondary">
                    📤 Импорт данных
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                <p className="help-text">
                  Экспортируйте свои данные для резервного копирования или импортируйте ранее сохраненные данные
                </p>
              </div>

              <div className="danger-zone">
                <h4>Опасная зона</h4>
                <div className="danger-actions">
                  <button className="btn btn-danger">
                    🗑️ Удалить семью
                  </button>
                  <button className="btn btn-danger">
                    🚪 Покинуть семью
                  </button>
                </div>
                <p className="warning-text">
                  Эти действия нельзя отменить. Все данные будут удалены безвозвратно.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Внешний вид</h2>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Тема оформления</h4>
                  <p>Выберите светлую или темную тему</p>
                </div>
                <div className="theme-selector">
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => theme !== 'light' && toggleTheme()}
                  >
                    ☀️ Светлая
                  </button>
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => theme !== 'dark' && toggleTheme()}
                  >
                    🌙 Темная
                  </button>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Компактный режим</h4>
                  <p>Уменьшить отступы и размеры элементов</p>
                </div>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Анимации</h4>
                  <p>Включить плавные анимации и переходы</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Валюта по умолчанию</h4>
                  <p>Основная валюта для отображения сумм</p>
                </div>
                <select className="currency-select">
                  <option value="RUB">Российский рубль (₽)</option>
                  <option value="USD">Доллар США ($)</option>
                  <option value="EUR">Евро (€)</option>
                </select>
              </div>

              <div className="preview-section">
                <h4>Предпросмотр</h4>
                <div className="preview-card">
                  <div className="preview-stats">
                    <div className="preview-stat">
                      <span className="preview-label">Доходы</span>
                      <span className="preview-value income">+₽50,000</span>
                    </div>
                    <div className="preview-stat">
                      <span className="preview-label">Расходы</span>
                      <span className="preview-value expense">-₽35,000</span>
                    </div>
                  </div>
                  <div className="preview-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Безопасность</h2>
              
              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label>Текущий пароль</label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                    placeholder="Введите текущий пароль"
                  />
                </div>

                <div className="form-group">
                  <label>Новый пароль</label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    placeholder="Введите новый пароль"
                  />
                </div>

                <div className="form-group">
                  <label>Подтвердите пароль</label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    placeholder="Повторите новый пароль"
                  />
                </div>

                <div className="password-requirements">
                  <h5>Требования к паролю:</h5>
                  <ul>
                    <li>Минимум 8 символов</li>
                    <li>Хотя бы одна заглавная буква</li>
                    <li>Хотя бы одна цифра</li>
                    <li>Хотя бы один специальный символ</li>
                  </ul>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Сменить пароль
                  </button>
                </div>
              </form>

              <div className="security-features">
                <h4>Дополнительная безопасность</h4>
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h5>Двухфакторная аутентификация</h5>
                    <p>Дополнительная защита вашего аккаунта</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h5>Сеансы устройств</h5>
                    <p>Управление активными сеансами</p>
                  </div>
                  <button className="btn btn-secondary">
                    Просмотреть
                  </button>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h5>История входов</h5>
                    <p>Последние действия в вашем аккаунте</p>
                  </div>
                  <button className="btn btn-secondary">
                    Проверить
                  </button>
                </div>
              </div>

              <div className="danger-zone">
                <h4>Удаление аккаунта</h4>
                <p>
                  Это действие нельзя отменить. Все ваши данные будут удалены безвозвратно, 
                  включая историю операций и настройки семьи.
                </p>
                <button className="btn btn-danger">
                  🗑️ Удалить мой аккаунт
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;