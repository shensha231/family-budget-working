import React from 'react';

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div style={{ 
      background: '#2D3748', 
      padding: '1.5rem', 
      borderRadius: '12px',
      color: 'white'
    }}>
      {title && <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>{title}</h3>}
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        {/* Простая круговая диаграмма */}
        <div style={{ 
          width: '200px', 
          height: '200px', 
          borderRadius: '50%',
          background: `conic-gradient(${data.map((item, index) => 
            `${item.color} 0% ${(item.value / total) * 100}%`
          ).join(', ')})`,
          marginBottom: '1rem'
        }} />
        
        {/* Легенда */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: item.color 
                }} />
                <span>{item.name}</span>
              </div>
              <span style={{ fontWeight: 'bold' }}>
                {formatCurrency(item.value)} ({(item.value / total * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Вспомогательная функция для форматирования
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};