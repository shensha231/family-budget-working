import React from 'react';
import { formatCurrency, formatDate, getCategoryName, getCategoryColor } from '../../utils/formatters';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete?: (id: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: 'white' }}>📋 История операций</h3>
      
      {transactions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          background: '#2D3748', 
          borderRadius: '12px',
          color: '#A0AEC0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
          <p>Нет операций для отображения</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                background: '#2D3748',
                borderRadius: '8px',
                borderLeft: `4px solid ${getCategoryColor(transaction.category)}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: transaction.type === 'income' ? '#48BB78' : '#F56565',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  {transaction.type === 'income' ? '📥' : '📤'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: 'white' }}>
                    {getCategoryName(transaction.category)}
                  </div>
                  <div style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>
                    {transaction.description}
                  </div>
                  <div style={{ color: '#718096', fontSize: '0.8rem' }}>
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  fontWeight: 'bold',
                  color: transaction.type === 'income' ? '#48BB78' : '#F56565',
                  fontSize: '1.1rem'
                }}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(transaction.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F56565',
                      cursor: 'pointer',
                      fontSize: '1.2rem'
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};