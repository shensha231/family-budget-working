// Финансовые расчеты и формулы

// Расчет сложного процента
export const calculateCompoundInterest = (
  principal: number,
  monthlyContribution: number,
  annualRate: number,
  years: number
): { total: number; totalContributions: number; interestEarned: number } => {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  let total = principal;
  for (let i = 0; i < months; i++) {
    total = total * (1 + monthlyRate) + monthlyContribution;
  }

  const totalContributions = principal + (monthlyContribution * months);
  const interestEarned = total - totalContributions;

  return {
    total: Math.round(total),
    totalContributions: Math.round(totalContributions),
    interestEarned: Math.round(interestEarned)
  };
};

// Расчет аннуитетного платежа
export const calculateLoanPayment = (
  loanAmount: number,
  annualRate: number,
  years: number
): { monthlyPayment: number; totalPayment: number; totalInterest: number } => {
  const monthlyRate = annualRate / 100 / 12;
  const months = years * 12;
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
    (Math.pow(1 + monthlyRate, months) - 1);

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - loanAmount;

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest)
  };
};

// Правило 72 для расчета времени удвоения
export const ruleOf72 = (annualRate: number): number => {
  return 72 / annualRate;
};

// Расчет коэффициента долговой нагрузки
export const calculateDebtToIncome = (
  monthlyDebtPayments: number,
  monthlyIncome: number
): number => {
  return (monthlyDebtPayments / monthlyIncome) * 100;
};

// Расчет нормы сбережений
export const calculateSavingsRate = (
  income: number,
  expenses: number
): number => {
  return ((income - expenses) / income) * 100;
};

// Расчет будущей стоимости единовременного вложения
export const calculateFutureValue = (
  presentValue: number,
  annualRate: number,
  years: number
): number => {
  return presentValue * Math.pow(1 + annualRate / 100, years);
};

// Расчет необходимого пенсионного капитала
export const calculateRetirementNeeds = (
  desiredMonthlyIncome: number,
  yearsInRetirement: number,
  inflationRate: number = 3
): number => {
  const annualIncome = desiredMonthlyIncome * 12;
  const realRate = 0.03; // Реальная доходность после инфляции
  const presentValue = annualIncome * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate);
  
  return Math.round(presentValue);
};

// Анализ бюджета по правилу 50/30/20
export const analyzeBudget502030 = (
  income: number,
  needs: number,
  wants: number,
  savings: number
): { isBalanced: boolean; recommendations: string[] } => {
  const needsPercentage = (needs / income) * 100;
  const wantsPercentage = (wants / income) * 100;
  const savingsPercentage = (savings / income) * 100;

  const recommendations: string[] = [];

  if (needsPercentage > 50) {
    recommendations.push('Сократите обязательные расходы');
  }
  if (wantsPercentage > 30) {
    recommendations.push('Уменьшите произвольные траты');
  }
  if (savingsPercentage < 20) {
    recommendations.push('Увеличьте норму сбережений');
  }

  return {
    isBalanced: needsPercentage <= 50 && wantsPercentage <= 30 && savingsPercentage >= 20,
    recommendations
  };
};