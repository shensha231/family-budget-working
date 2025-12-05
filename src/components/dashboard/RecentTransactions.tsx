import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecentTransactions.css';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  icon: string;
}

const RecentTransactions: React.FC = () => {
  const navigate = useNavigate();

  const transactions: Transaction[] = [
    {
      id: 1,
      description: 'Продукты в Пятерочке',
      amount: -2543,
      category: 'Продукты',
      date: '2024-11-15',
      type: 'expense',
      icon: '🛒'
    },
    {
      id: 2,
      description: 'Зарплата',
      amount: 75000,
      category: 'Доход',
      date: '2024-11-10',
      type: 'income',
      icon: '💼'
    },
    {
      id: 3,
      description: 'Бензин',
      amount: -3500,
      category: 'Транспорт',
      date: '2024-11-08',
      type: 'expense',
      icon: '⛽'
    },
    {
      id: 4,
      description: 'Кино',
      amount: -1200,
      category: 'Развлечения',
      date: '2024-11-05',
      type: 'expense',
      icon: '🎬'
    },
    {
      id: 5,
      description: 'Фриланс',
      amount: 15000,
      category: 'Доход',
      date: '2024-11-01',
      type: 'income',
      icon: '💻'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getAmountColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'var(--success)' : 'var(--error)';
  };

  const getAmountPrefix = (type: 'income' | 'expense') => {
    return type === 'income' ? '+' : '-';
  };

  return (
    <div className="recent-transactions card">
      <div className="transactions-header">
        <div className="header-title">
          <h2>Последние операции</h2>
          <span className="transactions-count">{transactions.length} операций</span>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/operations')}
        >
          Все операции →
        </button>
      </div>

      <div className="transactions-list">
        {transactions.map((transaction, index) => (
          <div 
            key={transaction.id}
            className={`transaction-item slide-up ${transaction.type}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => navigate(`/operations?edit=${transaction.id}`)}
          >
            <div className="transaction-main">
              <div 
                className="transaction-icon"
                style={{ 
                  backgroundColor: `${getAmountColor(transaction.type)}15`,
                  border: `2px solid ${getAmountColor(transaction.type)}30`
                }}
              >
                <span style={{ color: getAmountColor(transaction.type) }}>
                  {transaction.icon}
                </span>
              </div>
              
              <div className="transaction-info">
                <div className="transaction-description">
                  {transaction.description}
                </div>
                <div className="transaction-meta">
                  <span className="transaction-category">
                    {transaction.category}
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.date)}
                  </span>
                </div>
              </div>

              <div 
                className={`transaction-amount ${transaction.type}`}
                style={{ color: getAmountColor(transaction.type) }}
              >
                <span className="amount-prefix">
                  {getAmountPrefix(transaction.type)}
                </span>
                ₽{Math.abs(transaction.amount).toLocaleString()}
              </div>
            </div>

            <div className="transaction-hover-effect"></div>
            <div 
              className="transaction-glow"
              style={{ background: getAmountColor(transaction.type) }}
            ></div>
          </div>
        ))}
      </div>

      <div className="transactions-summary">
        <div className="summary-item">
          <span className="summary-label">Общий доход</span>
          <span className="summary-value income">
            +₽{transactions
              .filter(t => t.type === 'income')
              .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              .toLocaleString()}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Общий расход</span>
          <span className="summary-value expense">
            -₽{transactions
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + Math.abs(t.amount), 0)
              .toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;