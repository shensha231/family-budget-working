import React, { useState } from 'react';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

interface CategoryManagerProps {
  transactions: Array<{
    category: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
  onCategoryUpdate?: (oldCategory: string, newCategory: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  transactions,
  onCategoryUpdate 
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Анализ расходов по категориям
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  const startEditing = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(CATEGORIES[category as keyof typeof CATEGORIES]?.name || category);
  };

  const saveCategory = () => {
    if (editingCategory && newCategoryName && onCategoryUpdate) {
      onCategoryUpdate(editingCategory, newCategoryName);
    }
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setNewCategoryName('');
  };

  return (
    <div style={{ background: '#2D3748', padding: '1.5rem', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: 'white' }}>
        🗂️ Управление категориями
      </h3>

      {Object.keys(expensesByCategory).length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#A0AEC0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p>Нет данных по категориям</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES];

              return (
                <div
                  key={category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    background: '#4A5568',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${categoryInfo?.color || '#A0AEC0'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>
                      {categoryInfo?.name.split(' ')[0] || '📦'}
                    </div>
                    <div>
                      {editingCategory === category ? (
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #4A5568',
                            background: '#1A202C',
                            color: 'white'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 'bold', color: 'white' }}>
                          {categoryInfo?.name || category}
                        </div>
                      )}
                      <div style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>
                        {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingCategory === category ? (
                      <>
                        <button
                          onClick={saveCategory}
                          style={{
                            background: '#48BB78',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ✅
                        </button>
                        <button
                          onClick={cancelEditing}
                          style={{
                            background: '#718096',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ❌
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditing(category)}
                        style={{
                          background: '#4299E1',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ✏️
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #4A5568' }}>
        <div style={{ color: '#A0AEC0', fontSize: '0.9rem' }}>
          Всего расходов: {formatCurrency(totalExpenses)}
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;