import React, { useState } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import './Operations.css';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

const Operations: React.FC = () => {
  const { family, setFamily } = useFamily();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    income: ['Зарплата', 'Фриланс', 'Инвестиции', 'Подарки', 'Прочее'],
    expense: ['Продукты', 'Транспорт', 'Развлечения', 'Жилье', 'Здоровье', 'Одежда', 'Образование', 'Прочее']
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount) * (formData.type === 'expense' ? -1 : 1),
      category: formData.category,
      description: formData.description,
      date: formData.date
    };

    setTransactions(prev => [newTransaction, ...prev]);
    
    // Обновляем бюджет семьи
    if (family) {
      const newBudget = family.budget + newTransaction.amount;
      setFamily({
        ...family,
        budget: newBudget
      });
    }

    // Сбрасываем форму
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction && family) {
      // Возвращаем деньги в бюджет
      setFamily({
        ...family,
        budget: family.budget - transaction.amount
      });
    }
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="operations-page">
      <div className="page-header">
        <h1>Операции 💸</h1>
        <p>Управление доходами и расходами</p>
      </div>

      <div className="operations-stats">
        <div className="stat-card">
          <div className="stat-icon income">💰</div>
          <div className="stat-info">
            <h3>+₽{totalIncome.toLocaleString()}</h3>
            <p>Общий доход</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expense">💸</div>
          <div className="stat-info">
            <h3>-₽{totalExpenses.toLocaleString()}</h3>
            <p>Общий расход</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon balance">⚖️</div>
          <div className="stat-info">
            <h3 className={balance >= 0 ? 'positive' : 'negative'}>
              {balance >= 0 ? '+' : ''}₽{Math.abs(balance).toLocaleString()}
            </h3>
            <p>Баланс</p>
          </div>
        </div>
      </div>

      <div className="operations-actions">
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Добавить операцию
        </button>
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="transaction-form card">
            <div className="form-header">
              <h2>Новая операция</h2>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Тип операции</label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'income' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type: 'income'})}
                  >
                    💰 Доход
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${formData.type === 'expense' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, type: 'expense'})}
                  >
                    💸 Расход
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Сумма (₽)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="form-group">
                <label>Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories[formData.type].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Описание</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Краткое описание операции"
                  required
                />
              </div>

              <div className="form-group">
                <label>Дата</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  Добавить операцию
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="transactions-list">
        <h2>История операций</h2>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>Нет операций</h3>
            <p>Добавьте первую операцию чтобы начать отслеживать финансы</p>
          </div>
        ) : (
          <div className="transactions">
            {transactions.map(transaction => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                <div className="transaction-icon">
                  {transaction.type === 'income' ? '💰' : '💸'}
                </div>
                <div className="transaction-info">
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  <div className="transaction-meta">
                    <span className="category">{transaction.category}</span>
                    <span className="date">
                      {new Date(transaction.date).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === 'income' ? '+' : '-'}₽{Math.abs(transaction.amount).toLocaleString()}
                </div>
                <button 
                  className="delete-btn"
                  onClick={() => deleteTransaction(transaction.id)}
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Operations;