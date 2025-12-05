import React from 'react';
import './BudgetOverview.css';

const BudgetOverview: React.FC = () => {
  const categories = [
    { name: 'Продукты', spent: 15000, budget: 20000, color: '#3B82F6', icon: '🛒' },
    { name: 'Транспорт', spent: 8000, budget: 10000, color: '#8B5CF6', icon: '🚗' },
    { name: 'Развлечения', spent: 5000, budget: 8000, color: '#10B981', icon: '🎬' },
    { name: 'Жилье', spent: 12000, budget: 15000, color: '#F59E0B', icon: '🏠' },
    { name: 'Здоровье', spent: 3000, budget: 5000, color: '#EF4444', icon: '🏥' },
  ];

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="budget-overview card slide-up">
      <div className="budget-header">
        <div className="budget-title-section">
          <h2>Обзор бюджета</h2>
          <p>Распределение расходов по категориям</p>
        </div>
        <div className="budget-period">
          <span>Ноябрь 2024</span>
          <div className="budget-total">
            ₽{totalSpent.toLocaleString()} / ₽{totalBudget.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="budget-summary">
        <div className="summary-item">
          <div className="summary-label">Общий бюджет</div>
          <div className="summary-value">₽{totalBudget.toLocaleString()}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Потрачено</div>
          <div className="summary-value spent">₽{totalSpent.toLocaleString()}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Остаток</div>
          <div className={`summary-value ${remaining >= 0 ? 'remaining' : 'overbudget'}`}>
            {remaining >= 0 ? '+' : ''}₽{Math.abs(remaining).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="budget-categories">
        {categories.map((category, index) => {
          const percentage = (category.spent / category.budget) * 100;
          const isOverBudget = category.spent > category.budget;
          const remainingCategory = category.budget - category.spent;
          
          return (
            <div 
              key={category.name}
              className="category-item slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="category-header">
                <div className="category-info">
                  <div 
                    className="category-icon"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    <span style={{ color: category.color }}>{category.icon}</span>
                  </div>
                  <div className="category-details">
                    <div className="category-name">{category.name}</div>
                    <div className="category-amounts">
                      <span className="spent">₽{category.spent.toLocaleString()}</span>
                      <span className="budget">/ ₽{category.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="category-status">
                  <span className={`percentage ${isOverBudget ? 'over' : ''}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className={`remaining ${remainingCategory >= 0 ? 'positive' : 'negative'}`}>
                    {remainingCategory >= 0 ? '+' : '-'}₽{Math.abs(remainingCategory).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="progress-container">
                <div 
                  className="progress-bar"
                  style={{ 
                    '--progress-width': `${Math.min(percentage, 100)}%`,
                    '--progress-color': category.color
                  } as React.CSSProperties}
                  data-over={isOverBudget}
                >
                  <div className="progress-fill"></div>
                  <div className="progress-bg"></div>
                </div>
                <div className="progress-marker" style={{ left: '100%' }}>
                  <div className="marker-line"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="budget-footer">
        <div className="budget-tips">
          <span className="tip-icon">💡</span>
          <span className="tip-text">
            {remaining >= 0 
              ? `Отлично! У вас осталось ₽${remaining.toLocaleString()} до конца месяца`
              : 'Внимание! Вы превысили бюджет на некоторые категории'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;