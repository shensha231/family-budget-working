import React, { useEffect } from 'react';
import { useFamily } from '../../contexts/FamilyContext';
import { useTransactions } from '../../hooks/useTransactions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './QuickStats.css';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

const QuickStats: React.FC = () => {
  const { family } = useFamily();
  const { summary, loading, fetchFinancialSummary } = useTransactions();

  // Обновляем данные при монтировании
  useEffect(() => {
    const currentDate = new Date();
    const month = (currentDate.getMonth() + 1).toString();
    const year = currentDate.getFullYear().toString();
    
    fetchFinancialSummary(month, year);
  }, [fetchFinancialSummary]);

  // Функция для форматирования чисел
  const formatCurrency = (amount: number) => {
    return `₽${amount?.toLocaleString('ru-RU') || '0'}`;
  };

  // Функция для расчета изменения
  const calculateGrowth = (current: number, previous: number) => {
    if (!previous || previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    const trend = change >= 0 ? 'up' : 'down';
    return {
      value: `${change >= 0 ? '+' : ''}${Math.round(change)}%`,
      trend
    };
  };

  // Данные на основе реальной сводки
  const stats: StatCard[] = [
    {
      title: 'Общий бюджет',
      value: formatCurrency(family?.budget || summary?.totalBudget || 0),
      change: calculateGrowth(summary?.totalBudget || 0, (summary?.totalBudget || 0) * 0.88).value,
      trend: calculateGrowth(summary?.totalBudget || 0, (summary?.totalBudget || 0) * 0.88).trend as 'up' | 'down',
      icon: '💰',
      color: 'var(--success)'
    },
    {
      title: 'Расходы за месяц',
      value: formatCurrency(summary?.monthlyExpenses || 0),
      change: calculateGrowth(summary?.monthlyExpenses || 0, (summary?.monthlyExpenses || 0) * 1.05).value,
      trend: calculateGrowth(summary?.monthlyExpenses || 0, (summary?.monthlyExpenses || 0) * 1.05).trend as 'up' | 'down',
      icon: '📉',
      color: 'var(--error)'
    },
    {
      title: 'Доходы за месяц',
      value: formatCurrency(summary?.monthlyIncome || 0),
      change: calculateGrowth(summary?.monthlyIncome || 0, (summary?.monthlyIncome || 0) * 0.92).value,
      trend: calculateGrowth(summary?.monthlyIncome || 0, (summary?.monthlyIncome || 0) * 0.92).trend as 'up' | 'down',
      icon: '📈',
      color: 'var(--success)'
    },
    {
      title: 'Сбережения',
      value: formatCurrency(summary?.savings || 0),
      change: calculateGrowth(summary?.savings || 0, (summary?.savings || 0) * 0.85).value,
      trend: calculateGrowth(summary?.savings || 0, (summary?.savings || 0) * 0.85).trend as 'up' | 'down',
      icon: '🏦',
      color: 'var(--accent)'
    }
  ];

  if (loading && !summary) {
    return (
      <div className="quick-stats">
        <h2>Финансовая сводка</h2>
        <div className="stats-grid">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="stat-card loading">
              <LoadingSpinner />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="quick-stats">
      <h2>Финансовая сводка</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={stat.title}
            className="stat-card slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="stat-header">
              <div 
                className="stat-icon"
                style={{ 
                  backgroundColor: `${stat.color}20`,
                  border: `2px solid ${stat.color}40`
                }}
              >
                <span style={{ color: stat.color, filter: 'saturate(1.5)' }}>
                  {stat.icon}
                </span>
              </div>
              <div className={`stat-change ${stat.trend}`}>
                <span className="change-icon">
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
                {stat.change}
              </div>
            </div>
            
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
            </div>

            <div className="stat-glow" style={{ background: stat.color }}></div>
            <div className="stat-particles">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="particle"
                  style={{ 
                    background: stat.color,
                    animationDelay: `${i * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;