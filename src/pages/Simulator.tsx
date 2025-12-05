import React, { useState, useEffect } from 'react';
import './Simulator.css';

interface Scenario {
  id: string;
  name: string;
  description: string;
  initialBudget: number;
  monthlyIncome: number;
  expenses: Expense[];
  goals: Goal[];
}

interface Expense {
  category: string;
  amount: number;
  growthRate: number; // годовой рост в %
}

interface Goal {
  name: string;
  targetAmount: number;
  targetDate: string;
  priority: 'high' | 'medium' | 'low';
}

const Simulator: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string>('basic');
  const [currentMonth, setCurrentMonth] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 5x
  const [results, setResults] = useState<any[]>([]);

  const scenarios: Scenario[] = [
    {
      id: 'basic',
      name: 'Базовый сценарий',
      description: 'Стандартный бюджет средней семьи',
      initialBudget: 50000,
      monthlyIncome: 150000,
      expenses: [
        { category: 'Жилье', amount: 40000, growthRate: 5 },
        { category: 'Продукты', amount: 30000, growthRate: 7 },
        { category: 'Транспорт', amount: 15000, growthRate: 8 },
        { category: 'Развлечения', amount: 20000, growthRate: 10 },
        { category: 'Сбережения', amount: 25000, growthRate: 0 },
        { category: 'Прочее', amount: 20000, growthRate: 6 }
      ],
      goals: [
        { name: 'Накопить на отпуск', targetAmount: 150000, targetDate: '2024-12-31', priority: 'medium' },
        { name: 'Ремонт кухни', targetAmount: 300000, targetDate: '2025-06-30', priority: 'high' }
      ]
    },
    {
      id: 'optimistic',
      name: 'Оптимистичный сценарий',
      description: 'Рост доходов при контроле расходов',
      initialBudget: 50000,
      monthlyIncome: 150000,
      expenses: [
        { category: 'Жилье', amount: 35000, growthRate: 4 },
        { category: 'Продукты', amount: 25000, growthRate: 5 },
        { category: 'Транспорт', amount: 12000, growthRate: 6 },
        { category: 'Развлечения', amount: 15000, growthRate: 8 },
        { category: 'Сбережения', amount: 40000, growthRate: 0 },
        { category: 'Инвестиции', amount: 20000, growthRate: 0 },
        { category: 'Прочее', amount: 15000, growthRate: 5 }
      ],
      goals: [
        { name: 'Покупка автомобиля', targetAmount: 800000, targetDate: '2026-12-31', priority: 'high' },
        { name: 'Накопления на образование', targetAmount: 500000, targetDate: '2027-06-30', priority: 'medium' }
      ]
    },
    {
      id: 'pessimistic',
      name: 'Консервативный сценарий',
      description: 'Снижение доходов при росте расходов',
      initialBudget: 30000,
      monthlyIncome: 120000,
      expenses: [
        { category: 'Жилье', amount: 45000, growthRate: 8 },
        { category: 'Продукты', amount: 35000, growthRate: 10 },
        { category: 'Транспорт', amount: 18000, growthRate: 12 },
        { category: 'Развлечения', amount: 10000, growthRate: 5 },
        { category: 'Сбережения', amount: 10000, growthRate: 0 },
        { category: 'Прочее', amount: 15000, growthRate: 7 }
      ],
      goals: [
        { name: 'Создать резервный фонд', targetAmount: 200000, targetDate: '2025-12-31', priority: 'high' },
        { name: 'Погасить долги', targetAmount: 150000, targetDate: '2024-12-31', priority: 'high' }
      ]
    }
  ];

  const currentScenario = scenarios.find(s => s.id === activeScenario);

  const runSimulation = () => {
    if (!currentScenario) return;

    const monthlyResults = [];
    let currentBudget = currentScenario.initialBudget;
    let currentIncome = currentScenario.monthlyIncome;
    const currentExpenses = [...currentScenario.expenses];

    for (let month = 0; month <= 60; month++) { // 5 лет симуляции
      // Расчет общего расхода за месяц
      const totalExpense = currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Обновление бюджета
      const monthlyBalance = currentIncome - totalExpense;
      currentBudget += monthlyBalance;

      // Ежегодное обновление доходов и расходов
      if (month > 0 && month % 12 === 0) {
        currentIncome *= 1.05; // 5% рост доходов ежегодно
        
        // Обновление расходов с учетом инфляции
        currentExpenses.forEach(expense => {
          expense.amount *= (1 + expense.growthRate / 100);
        });
      }

      monthlyResults.push({
        month,
        budget: currentBudget,
        income: currentIncome,
        expenses: totalExpense,
        balance: monthlyBalance,
        date: new Date(2024, 0 + month, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
      });
    }

    setResults(monthlyResults);
  };

  useEffect(() => {
    runSimulation();
  }, [activeScenario]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentMonth < 60) {
      interval = setInterval(() => {
        setCurrentMonth(prev => Math.min(prev + 1, 60));
      }, 1000 / speed);
    }

    return () => clearInterval(interval);
  }, [isRunning, currentMonth, speed]);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const resetSimulation = () => {
    setCurrentMonth(0);
    setIsRunning(false);
  };

  const currentResult = results[currentMonth];
  const totalSavings = currentResult?.budget || 0;
  const monthlyBalance = currentResult?.balance || 0;

  return (
    <div className="simulator-page">
      <div className="page-header">
        <h1>Симулятор 🎮</h1>
        <p>Протестируйте различные финансовые сценарии</p>
      </div>

      <div className="simulator-layout">
        <div className="scenarios-sidebar">
          <h3>Сценарии</h3>
          {scenarios.map(scenario => (
            <div
              key={scenario.id}
              className={`scenario-card ${activeScenario === scenario.id ? 'active' : ''}`}
              onClick={() => setActiveScenario(scenario.id)}
            >
              <h4>{scenario.name}</h4>
              <p>{scenario.description}</p>
              <div className="scenario-stats">
                <span>Начальный бюджет: ₽{scenario.initialBudget.toLocaleString()}</span>
                <span>Месячный доход: ₽{scenario.monthlyIncome.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="simulator-content">
          <div className="simulator-controls">
            <div className="control-group">
              <button 
                className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? '⏸️ Пауза' : '▶️ Запуск'}
              </button>
              <button className="btn btn-secondary" onClick={resetSimulation}>
                🔄 Сброс
              </button>
            </div>

            <div className="speed-controls">
              <span>Скорость:</span>
              <button 
                className={`speed-btn ${speed === 1 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(1)}
              >
                1x
              </button>
              <button 
                className={`speed-btn ${speed === 2 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(2)}
              >
                2x
              </button>
              <button 
                className={`speed-btn ${speed === 5 ? 'active' : ''}`}
                onClick={() => handleSpeedChange(5)}
              >
                5x
              </button>
            </div>

            <div className="time-display">
              <span>Текущее время: {currentResult?.date}</span>
              <span>Месяц: {currentMonth}/60</span>
            </div>
          </div>

          {currentScenario && currentResult && (
            <div className="simulation-results">
              <div className="key-metrics">
                <div className="metric-card">
                  <div className="metric-icon">💰</div>
                  <div className="metric-info">
                    <h3>₽{totalSavings.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</h3>
                    <p>Общие накопления</p>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📈</div>
                  <div className="metric-info">
                    <h3 className={monthlyBalance >= 0 ? 'positive' : 'negative'}>
                      {monthlyBalance >= 0 ? '+' : ''}₽{Math.abs(monthlyBalance).toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                    </h3>
                    <p>Месячный баланс</p>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">💸</div>
                  <div className="metric-info">
                    <h3>₽{currentResult.income.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</h3>
                    <p>Месячный доход</p>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">📊</div>
                  <div className="metric-info">
                    <h3>₽{currentResult.expenses.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}</h3>
                    <p>Месячные расходы</p>
                  </div>
                </div>
              </div>

              <div className="charts-section">
                <div className="chart-card">
                  <h4>Динамика накоплений</h4>
                  <div className="simulation-chart">
                    <div className="chart-bars">
                      {results.slice(0, currentMonth + 1).map((result, index) => (
                        <div key={index} className="bar-container">
                          <div 
                            className="bar"
                            style={{ 
                              height: `${Math.min((result.budget / 2000000) * 100, 100)}%`,
                              opacity: index === currentMonth ? 1 : 0.7
                            }}
                            title={`${result.date}: ₽${result.budget.toLocaleString()}`}
                          ></div>
                          {index % 12 === 0 && (
                            <span className="year-label">{2024 + Math.floor(index / 12)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="expenses-breakdown">
                  <h4>Структура расходов</h4>
                  <div className="expenses-list">
                    {currentScenario.expenses.map((expense, index) => (
                      <div key={expense.category} className="expense-item">
                        <div className="expense-info">
                          <span className="expense-category">{expense.category}</span>
                          <span className="expense-amount">
                            ₽{expense.amount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="expense-growth">
                          <span>+{expense.growthRate}%/год</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="goals-section">
                <h4>Финансовые цели</h4>
                <div className="goals-list">
                  {currentScenario.goals.map((goal, index) => {
                    const progress = Math.min((totalSavings / goal.targetAmount) * 100, 100);
                    const isAchieved = totalSavings >= goal.targetAmount;
                    
                    return (
                      <div key={goal.name} className="goal-item">
                        <div className="goal-header">
                          <span className="goal-name">{goal.name}</span>
                          <span className="goal-priority">{goal.priority === 'high' ? '🔴 Высокий' : goal.priority === 'medium' ? '🟡 Средний' : '🟢 Низкий'}</span>
                        </div>
                        <div className="goal-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="goal-meta">
                            <span>₽{totalSavings.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} / ₽{goal.targetAmount.toLocaleString()}</span>
                            <span>{progress.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="goal-deadline">
                          <span>Срок: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}</span>
                          {isAchieved && <span className="achieved-badge">✅ Достигнуто</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Simulator;