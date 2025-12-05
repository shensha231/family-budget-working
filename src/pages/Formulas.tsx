import React, { useState } from 'react';
import './Formulas.css';

interface CalculationResult {
  formula: string;
  result: number;
  description: string;
}

const Formulas: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'savings' | 'loans' | 'investments' | 'budgeting'>('savings');
  const [results, setResults] = useState<CalculationResult[]>([]);

  // Состояния для калькуляторов
  const [savingsData, setSavingsData] = useState({
    initialAmount: 10000,
    monthlyDeposit: 5000,
    annualRate: 8,
    years: 5
  });

  const [loanData, setLoanData] = useState({
    loanAmount: 1000000,
    annualRate: 12,
    years: 5
  });

  const [investmentData, setInvestmentData] = useState({
    initialInvestment: 50000,
    monthlyInvestment: 10000,
    annualReturn: 15,
    years: 10
  });

  const [budgetData, setBudgetData] = useState({
    monthlyIncome: 150000,
    essentialExpenses: 80000,
    discretionaryExpenses: 40000,
    savingsGoal: 30000
  });

  // Расчет сложного процента
  const calculateCompoundInterest = () => {
    const { initialAmount, monthlyDeposit, annualRate, years } = savingsData;
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    let total = initialAmount;
    for (let i = 0; i < months; i++) {
      total = total * (1 + monthlyRate) + monthlyDeposit;
    }

    const totalDeposited = initialAmount + (monthlyDeposit * months);
    const interestEarned = total - totalDeposited;

    setResults([{
      formula: 'Сложный процент с ежемесячными пополнениями',
      result: total,
      description: `За ${years} лет вы накопите ₽${total.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}. Из них ₽${interestEarned.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} - это начисленные проценты.`
    }]);
  };

  // Расчет аннуитетного платежа
  const calculateLoanPayment = () => {
    const { loanAmount, annualRate, years } = loanData;
    const monthlyRate = annualRate / 100 / 12;
    const months = years * 12;
    
    const monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
      (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - loanAmount;

    setResults([{
      formula: 'Аннуитетный платеж по кредиту',
      result: monthlyPayment,
      description: `Ежемесячный платеж: ₽${monthlyPayment.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}. Общая переплата: ₽${totalInterest.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}.`
    }]);
  };

  // Расчет инвестиционного портфеля
  const calculateInvestmentGrowth = () => {
    const { initialInvestment, monthlyInvestment, annualReturn, years } = investmentData;
    const monthlyReturn = annualReturn / 100 / 12;
    const months = years * 12;
    
    let total = initialInvestment;
    for (let i = 0; i < months; i++) {
      total = total * (1 + monthlyReturn) + monthlyInvestment;
    }

    const totalInvested = initialInvestment + (monthlyInvestment * months);
    const profit = total - totalInvested;

    setResults([{
      formula: 'Рост инвестиционного портфеля',
      result: total,
      description: `Через ${years} лет ваш портфель составит ₽${total.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}. Прибыль: ₽${profit.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}.`
    }]);
  };

  // Расчет бюджета
  const calculateBudget = () => {
    const { monthlyIncome, essentialExpenses, discretionaryExpenses, savingsGoal } = budgetData;
    
    const totalExpenses = essentialExpenses + discretionaryExpenses;
    const savings = monthlyIncome - totalExpenses;
    const savingsRate = (savings / monthlyIncome) * 100;
    const isGoalAchieved = savings >= savingsGoal;

    setResults([{
      formula: 'Анализ бюджета',
      result: savings,
      description: `Ежемесячные сбережения: ₽${savings.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} (${savingsRate.toFixed(1)}% от дохода). ${isGoalAchieved ? '✅ Цель по сбережениям достигнута!' : '❌ Цель не достигнута.'}`
    }]);
  };

  const renderSavingsCalculator = () => (
    <div className="calculator">
      <h3>Калькулятор накоплений</h3>
      <div className="input-group">
        <label>Начальная сумма (₽)</label>
        <input
          type="number"
          value={savingsData.initialAmount}
          onChange={(e) => setSavingsData({...savingsData, initialAmount: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Ежемесячное пополнение (₽)</label>
        <input
          type="number"
          value={savingsData.monthlyDeposit}
          onChange={(e) => setSavingsData({...savingsData, monthlyDeposit: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Годовая процентная ставка (%)</label>
        <input
          type="number"
          step="0.1"
          value={savingsData.annualRate}
          onChange={(e) => setSavingsData({...savingsData, annualRate: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Срок (лет)</label>
        <input
          type="number"
          value={savingsData.years}
          onChange={(e) => setSavingsData({...savingsData, years: Number(e.target.value)})}
        />
      </div>
      <button className="btn btn-primary" onClick={calculateCompoundInterest}>
        Рассчитать
      </button>
    </div>
  );

  const renderLoanCalculator = () => (
    <div className="calculator">
      <h3>Калькулятор кредита</h3>
      <div className="input-group">
        <label>Сумма кредита (₽)</label>
        <input
          type="number"
          value={loanData.loanAmount}
          onChange={(e) => setLoanData({...loanData, loanAmount: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Годовая ставка (%)</label>
        <input
          type="number"
          step="0.1"
          value={loanData.annualRate}
          onChange={(e) => setLoanData({...loanData, annualRate: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Срок (лет)</label>
        <input
          type="number"
          value={loanData.years}
          onChange={(e) => setLoanData({...loanData, years: Number(e.target.value)})}
        />
      </div>
      <button className="btn btn-primary" onClick={calculateLoanPayment}>
        Рассчитать
      </button>
    </div>
  );

  const renderInvestmentCalculator = () => (
    <div className="calculator">
      <h3>Калькулятор инвестиций</h3>
      <div className="input-group">
        <label>Начальные инвестиции (₽)</label>
        <input
          type="number"
          value={investmentData.initialInvestment}
          onChange={(e) => setInvestmentData({...investmentData, initialInvestment: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Ежемесячные инвестиции (₽)</label>
        <input
          type="number"
          value={investmentData.monthlyInvestment}
          onChange={(e) => setInvestmentData({...investmentData, monthlyInvestment: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Ожидаемая годовая доходность (%)</label>
        <input
          type="number"
          step="0.1"
          value={investmentData.annualReturn}
          onChange={(e) => setInvestmentData({...investmentData, annualReturn: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Срок инвестирования (лет)</label>
        <input
          type="number"
          value={investmentData.years}
          onChange={(e) => setInvestmentData({...investmentData, years: Number(e.target.value)})}
        />
      </div>
      <button className="btn btn-primary" onClick={calculateInvestmentGrowth}>
        Рассчитать
      </button>
    </div>
  );

  const renderBudgetCalculator = () => (
    <div className="calculator">
      <h3>Калькулятор бюджета</h3>
      <div className="input-group">
        <label>Ежемесячный доход (₽)</label>
        <input
          type="number"
          value={budgetData.monthlyIncome}
          onChange={(e) => setBudgetData({...budgetData, monthlyIncome: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Обязательные расходы (₽)</label>
        <input
          type="number"
          value={budgetData.essentialExpenses}
          onChange={(e) => setBudgetData({...budgetData, essentialExpenses: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Произвольные расходы (₽)</label>
        <input
          type="number"
          value={budgetData.discretionaryExpenses}
          onChange={(e) => setBudgetData({...budgetData, discretionaryExpenses: Number(e.target.value)})}
        />
      </div>
      <div className="input-group">
        <label>Цель по сбережениям (₽)</label>
        <input
          type="number"
          value={budgetData.savingsGoal}
          onChange={(e) => setBudgetData({...budgetData, savingsGoal: Number(e.target.value)})}
        />
      </div>
      <button className="btn btn-primary" onClick={calculateBudget}>
        Рассчитать
      </button>
    </div>
  );

  return (
    <div className="formulas-page">
      <div className="page-header">
        <h1>Формулы 🧮</h1>
        <p>Финансовые расчеты и калькуляторы</p>
      </div>

      <div className="formulas-layout">
        <div className="categories-sidebar">
          <button 
            className={`category-btn ${activeCategory === 'savings' ? 'active' : ''}`}
            onClick={() => setActiveCategory('savings')}
          >
            💰 Накопления
          </button>
          <button 
            className={`category-btn ${activeCategory === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveCategory('loans')}
          >
            🏠 Кредиты
          </button>
          <button 
            className={`category-btn ${activeCategory === 'investments' ? 'active' : ''}`}
            onClick={() => setActiveCategory('investments')}
          >
            📈 Инвестиции
          </button>
          <button 
            className={`category-btn ${activeCategory === 'budgeting' ? 'active' : ''}`}
            onClick={() => setActiveCategory('budgeting')}
          >
            💸 Бюджетирование
          </button>
        </div>

        <div className="calculators-content">
          <div className="calculator-section">
            {activeCategory === 'savings' && renderSavingsCalculator()}
            {activeCategory === 'loans' && renderLoanCalculator()}
            {activeCategory === 'investments' && renderInvestmentCalculator()}
            {activeCategory === 'budgeting' && renderBudgetCalculator()}
          </div>

          {results.length > 0 && (
            <div className="results-section">
              <h3>Результаты расчета</h3>
              {results.map((result, index) => (
                <div key={index} className="result-card">
                  <h4>{result.formula}</h4>
                  <div className="result-amount">
                    ₽{result.result.toLocaleString('ru-RU', { maximumFractionDigits: 0 })}
                  </div>
                  <p>{result.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="formulas-info">
            <h3>Популярные финансовые формулы</h3>
            <div className="formulas-grid">
              <div className="formula-card">
                <h4>Правило 72</h4>
                <p>Время удвоения капитала = 72 / годовая процентная ставка</p>
                <span className="formula-example">Пример: при 8% годовых капитал удвоится за 9 лет</span>
              </div>
              <div className="formula-card">
                <h4>Коэффициент долговой нагрузки</h4>
                <p>Ежемесячные платежи по долгам / Чистый ежемесячный доход</p>
                <span className="formula-example">Рекомендуется значение менее 35%</span>
              </div>
              <div className="formula-card">
                <h4>Формула аннуитетного платежа</h4>
                <p>Платеж = Сумма × (Ставка × (1 + Ставка)^Период) / ((1 + Ставка)^Период - 1)</p>
              </div>
              <div className="formula-card">
                <h4>Норма сбережений</h4>
                <p>(Доходы - Расходы) / Доходы × 100%</p>
                <span className="formula-example">Здоровая норма: 15-20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulas;