import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickStats from '../components/dashboard/QuickStats';
import BudgetOverview from '../components/dashboard/BudgetOverview';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: '💸',
      title: 'Добавить расход',
      description: 'Зафиксировать новую трату',
      onClick: () => navigate('/operations?type=expense')
    },
    {
      icon: '💰',
      title: 'Добавить доход',
      description: 'Записать новый доход',
      onClick: () => navigate('/operations?type=income')
    },
    {
      icon: '🎯',
      title: 'Цели',
      description: 'Управление финансовыми целями',
      onClick: () => navigate('/analysis')
    },
    {
      icon: '📊',
      title: 'Отчет',
      description: 'Создать финансовый отчет',
      onClick: () => navigate('/analysis')
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Добро пожаловать! 👋</h1>
          <p>Вот обзор вашего финансового состояния за ноябрь 2024</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/operations')}
          >
            💸 Добавить операцию
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/analysis')}
          >
            📊 Создать отчет
          </button>
        </div>
      </div>

      <div className="quick-actions-section">
        <h2>Быстрые действия</h2>
        <div className="quick-actions">
          {quickActions.map((action, index) => (
            <div 
              key={action.title}
              className="action-card slide-up"
              onClick={action.onClick}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="action-icon">{action.icon}</span>
              <div className="action-title">{action.title}</div>
              <div className="action-description">{action.description}</div>
            </div>
          ))}
        </div>
      </div>

      <QuickStats />

      <div className="dashboard-content">
        <div className="main-content-column">
          <BudgetOverview />
          
          <div className="charts-section">
            <div className="chart-card slide-up">
              <div className="chart-header">
                <h3>Расходы по категориям</h3>
                <span>За месяц</span>
              </div>
              <div className="simple-chart">
                {[
                  { name: 'Продукты', percentage: 35, color: '#3B82F6' },
                  { name: 'Транспорт', percentage: 25, color: '#8B5CF6' },
                  { name: 'Развлечения', percentage: 20, color: '#10B981' },
                  { name: 'Жилье', percentage: 15, color: '#F59E0B' },
                  { name: 'Прочее', percentage: 5, color: '#EF4444' }
                ].map((category, index) => (
                  <div key={category.name} className="chart-item">
                    <div className="chart-color" style={{backgroundColor: category.color}}></div>
                    <span className="chart-label">{category.name}</span>
                    <div className="chart-bar">
                      <div 
                        className="chart-bar-fill"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                    <span className="chart-value">{category.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card slide-up">
              <div className="chart-header">
                <h3>Динамика расходов</h3>
                <span>3 месяца</span>
              </div>
              <div className="bars-chart">
                {[
                  { month: 'Сен', value: 65, trend: 'up' },
                  { month: 'Окт', value: 80, trend: 'up' },
                  { month: 'Ноя', value: 45, trend: 'down' }
                ].map((data, index) => (
                  <div key={data.month} className="bar-container">
                    <div 
                      className="bar"
                      style={{height: `${data.value}%`}}
                      data-trend={data.trend}
                    ></div>
                    <span className="bar-label">{data.month}</span>
                    <span className="bar-value">₽{(data.value * 1000).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-column">
          <RecentTransactions />
          
          <div className="goals-card card slide-up">
            <div className="chart-header">
              <h3>Финансовые цели</h3>
              <span>2 из 4 выполнено</span>
            </div>
            <div className="goals-list">
              {[
                { name: 'Накопить на отпуск', progress: 75, target: '₽150,000', deadline: '2024-12-31' },
                { name: 'Ремонт кухни', progress: 30, target: '₽80,000', deadline: '2024-11-30' },
                { name: 'Новый телефон', progress: 100, target: '₽50,000', deadline: '2024-10-15' },
                { name: 'Курсы', progress: 45, target: '₽35,000', deadline: '2024-12-15' }
              ].map((goal, index) => (
                <div key={goal.name} className="goal-item">
                  <div className="goal-header">
                    <span className="goal-name">{goal.name}</span>
                    <span className="goal-target">{goal.target}</span>
                  </div>
                  <div className="goal-progress">
                    <div 
                      className="goal-progress-bar"
                      style={{width: `${goal.progress}%`}}
                      data-completed={goal.progress === 100}
                    ></div>
                  </div>
                  <div className="goal-meta">
                    <span className="goal-percentage">{goal.progress}%</span>
                    <span className="goal-deadline">{new Date(goal.deadline).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;