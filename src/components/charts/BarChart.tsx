import React from 'react';

interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  title?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div style={{ 
      background: '#2D3748', 
      padding: '1.5rem', 
      borderRadius: '12px',
      color: 'white'
    }}>
      {title && <h3 style={{ marginBottom: '1rem' }}>{title}</h3>}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ minWidth: '80px', fontSize: '0.9rem' }}>{item.label}</span>
            <div style={{ 
              flex: 1, 
              height: '30px', 
              background: '#4A5568',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div 
                style={{
                  height: '100%',
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.color || '#4299E1',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span style={{ minWidth: '80px', textAlign: 'right', fontWeight: 'bold' }}>
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0
  }).format(amount);
};