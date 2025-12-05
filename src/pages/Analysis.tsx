import React, { useState, useMemo } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import './Analysis.css';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Analysis: React.FC = () => {
  const { family } = useFamily();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'trends'>('overview');

  // Моковые данные для демонстрации
  const mockTransactions: Transaction[] = useMemo(() => [
    { id: '1', type: 'expense', amount: -2543, category: 'Продукты', description: 'Продукты в Пятерочке', date: '2024-11-15' },
    { id: '2', type: 'income', amount: 75000, category: 'Зарплата', description: 'Зарплата', date: '2024-11-10' },
    { id: '3', type: 'expense', amount: -3500, category: 'Транспорт', description: 'Бензин', date: '2024-11-08' },
    { id: '4', type: 'expense', amount: -1200, category: 'Развлечения', description: 'Кино', date: '2024-11-05' },
    { id: '5', type: 'income', amount: 15000, category: 'Фриланс', description: 'Фриланс', date: '2024-11-01' },
    { id: '6', type: 'expense', amount: -8000, category: 'Жилье', description: 'Коммунальные', date: '2024-10-28' },
    { id: '7', type: 'expense', amount: -5000, category: 'Здоровье', description: 'Стоматолог', date: '2024-10-25' },
  ], []);

  // Расчеты
  const calculations = useMemo(() => {
    const incomes = mockTransactions.filter(t => t.type === 'income');
    const expenses = mockTransactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomes.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    // Расходы по категориям
    const expensesByCategory = expenses.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Math.abs(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    // Тренды по месяцам
    const monthlyData = mockTransactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = { income: 0, expenses: 0, month: date.toLocaleDateString('ru-RU', { month: 'long' }) };
      }
      
      if (transaction.type === 'income') {
        acc[monthKey].income += Math.abs(transaction.amount);
      } else {
        acc[monthKey].expenses += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number; month: string }>);

    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      expensesByCategory,
      monthlyData: Object.values(monthlyData).slice(-6), // Последние 6 месяцев
      averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0,
      largestExpense: Math.max(...expenses.map(e => Math.abs(e.amount))),
      transactionCount: mockTransactions.length
    };
  }, [mockTransactions]);

  const getCategoryColor = (index: number) => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];
    return colors[index % colors.length];
  };

  const renderPieChart = () => {
    const categories = Object.entries(calculations.expensesByCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    const total = categories.reduce((sum, [, amount]) => sum + amount, 0);

    return (
      <div className="pie-chart">
        <div className="chart-container">
          <div className="pie" style={{ 
            background: `conic-gradient(${categories.map((_, i) => 
              `${getCategoryColor(i)} ${(categories.slice(0, i).reduce((sum, [, amount]) => sum + amount, 0) / total) * 100}% ${(categories.slice(0, i + 1).reduce((sum, [, amount]) => sum + amount, 0) / total) * 100}%`
            ).join(', ')})` 
          }}>
            <div className="pie-center">
              <span className="total">₽{total.toLocaleString()}</span>
              <span className="label">Всего</span>
            </div>
          </div>
        </div>
        <div className="chart-legend">
          {categories.map(([category, amount], index) => (
            <div key={category} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: getCategoryColor(index) }}
              ></div>
              <span className="legend-label">{category}</span>
              <span className="legend-value">
                ₽{amount.toLocaleString()} ({(amount / total * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    const maxValue = Math.max(
      ...calculations.monthlyData.map(d => Math.max(d.income, d.expenses))
    );

    return (
      <div className="trend-chart">
        <div className="chart-bars">
          {calculations.monthlyData.map((month, index) => (
            <div key={index} className="bar-group">
              <div className="bar-container">
                <div 
                  className="bar income-bar"
                  style={{ height: `${(month.income / maxValue) * 100}%` }}
                  title={`Доход: ₽${month.income.toLocaleString()}`}
                ></div>
                <div 
                  className="bar expense-bar"
                  style={{ height: `${(month.expenses / maxValue) * 100}%` }}
                  title={`Расход: ₽${month.expenses.toLocaleString()}`}
                ></div>
              </div>
              <span className="month-label">{month.month}</span>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color income"></div>
            <span>Доходы</span>
          </div>
          <div className="legend-item">
            <div className="legend-color expense"></div>
            <span>Расходы</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="analysis-page">
      <div className="page-header">
        <h1>Анализ 📈</h1>
        <p>Детальный анализ ваших финансов</p>
      </div>

      <div className="analysis-controls">
        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Неделя
          </button>
          <button 
            className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Месяц
          </button>
          <button 
            className={`time-btn ${timeRange === 'year' ? 'active' : ''}`}
            onClick={() => setTimeRange('year')}
          >
            Год
          </button>
        </div>

        <div className="tab-selector">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Обзор
          </button>
          <button 
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Категории
          </button>
          <button 
            className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            📈 Тренды
          </button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-icon income">💰</div>
          <div className="metric-info">
            <h3>+₽{calculations.totalIncome.toLocaleString()}</h3>
            <p>Общий доход</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon expense">💸</div>
          <div className="metric-info">
            <h3>-₽{calculations.totalExpenses.toLocaleString()}</h3>
            <p>Общий расход</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon balance">⚖️</div>
          <div className="metric-info">
            <h3 className={calculations.balance >= 0 ? 'positive' : 'negative'}>
              {calculations.balance >= 0 ? '+' : ''}₽{Math.abs(calculations.balance).toLocaleString()}
            </h3>
            <p>Баланс</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon savings">🏦</div>
          <div className="metric-info">
            <h3>{calculations.savingsRate.toFixed(1)}%</h3>
            <p>Норма сбережений</p>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Распределение расходов</h3>
              {renderPieChart()}
            </div>
            <div className="chart-card">
              <h3>Финансовые тренды</h3>
              {renderTrendChart()}
            </div>
          </div>

          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📊</div>
              <h4>Средний чек</h4>
              <p>₽{calculations.averageExpense.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</p>
              <span className="insight-desc">Средняя сумма расхода</span>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🔥</div>
              <h4>Крупнейшая трата</h4>
              <p>₽{calculations.largestExpense.toLocaleString()}</p>
              <span className="insight-desc">Самая большая операция</span>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🔄</div>
              <h4>Всего операций</h4>
              <p>{calculations.transactionCount}</p>
              <span className="insight-desc">За весь период</span>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💡</div>
              <h4>Рекомендация</h4>
              <p>{calculations.savingsRate >= 20 ? 'Отлично!' : 'Можно лучше'}</p>
              <span className="insight-desc">
                {calculations.savingsRate >= 20 
                  ? 'Вы откладываете достаточно средств' 
                  : 'Попробуйте увеличить норму сбережений'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="tab-content">
          <div className="categories-analysis">
            <h3>Детальный анализ по категориям</h3>
            <div className="categories-list">
              {Object.entries(calculations.expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = (amount / calculations.totalExpenses) * 100;
                  return (
                    <div key={category} className="category-item">
                      <div className="category-header">
                        <div className="category-info">
                          <div 
                            className="category-color"
                            style={{ backgroundColor: getCategoryColor(index) }}
                          ></div>
                          <span className="category-name">{category}</span>
                        </div>
                        <div className="category-amount">
                          ₽{amount.toLocaleString()} ({percentage.toFixed(1)}%)
                        </div>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getCategoryColor(index)
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="tab-content">
          <div className="trends-analysis">
            <h3>Динамика доходов и расходов</h3>
            <div className="trends-table">
              <div className="table-header">
                <span>Месяц</span>
                <span>Доходы</span>
                <span>Расходы</span>
                <span>Баланс</span>
                <span>Эффективность</span>
              </div>
              {calculations.monthlyData.map((month, index) => {
                const balance = month.income - month.expenses;
                const efficiency = month.income > 0 ? (balance / month.income) * 100 : 0;
                return (
                  <div key={index} className="table-row">
                    <span>{month.month}</span>
                    <span className="income">+₽{month.income.toLocaleString()}</span>
                    <span className="expense">-₽{month.expenses.toLocaleString()}</span>
                    <span className={balance >= 0 ? 'positive' : 'negative'}>
                      {balance >= 0 ? '+' : ''}₽{Math.abs(balance).toLocaleString()}
                    </span>
                    <span className={`efficiency ${efficiency >= 0 ? 'positive' : 'negative'}`}>
                      {efficiency >= 0 ? '+' : ''}{efficiency.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;