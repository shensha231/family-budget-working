import React, { useState } from 'react';
import { CATEGORIES, TRANSACTION_TYPES } from '../../utils/constants';

interface TransactionFormProps {
  onSubmit: (transaction: {
    amount: number;
    description: string;
    type: 'income' | 'expense';
    category: string;
  }) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onSubmit({
      amount: Number(amount),
      description,
      type,
      category
    });

    setAmount('');
    setDescription('');
  };

  return (
    <div style={{ 
      background: '#2D3748', 
      padding: '1.5rem', 
      borderRadius: '12px',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginBottom: '1rem' }}>💸 Новая операция</h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Тип операции */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A0AEC0' }}>
              Тип операции
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense')}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #4A5568',
                background: '#1A202C',
                color: 'white'
              }}
            >
              {Object.entries(TRANSACTION_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          {/* Категория */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A0AEC0' }}>
              Категория
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #4A5568',
                background: '#1A202C',
                color: 'white'
              }}
            >
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Сумма */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A0AEC0' }}>
            Сумма
          </label>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #4A5568',
              background: '#1A202C',
              color: 'white'
            }}
          />
        </div>

        {/* Описание */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#A0AEC0' }}>
            Описание
          </label>
          <input
            type="text"
            placeholder="На что потратили..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #4A5568',
              background: '#1A202C',
              color: 'white'
            }}
          />
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="submit"
            style={{
              flex: 1,
              background: '#48BB78',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Добавить
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#718096',
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
};