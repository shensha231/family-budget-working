// Константы приложения

export const CATEGORIES = {
  INCOME: [
    { value: 'salary', label: '💰 Зарплата', color: '#10B981' },
    { value: 'freelance', label: '💻 Фриланс', color: '#3B82F6' },
    { value: 'investment', label: '📈 Инвестиции', color: '#8B5CF6' },
    { value: 'gifts', label: '🎁 Подарки', color: '#EC4899' },
    { value: 'other_income', label: '💸 Прочие доходы', color: '#6B7280' }
  ],
  EXPENSE: [
    { value: 'food', label: '🛒 Продукты', color: '#EF4444' },
    { value: 'transport', label: '🚗 Транспорт', color: '#F59E0B' },
    { value: 'entertainment', label: '🎬 Развлечения', color: '#8B5CF6' },
    { value: 'housing', label: '🏠 Жилье', color: '#3B82F6' },
    { value: 'health', label: '🏥 Здоровье', color: '#10B981' },
    { value: 'education', label: '📚 Образование', color: '#6366F1' },
    { value: 'clothing', label: '👕 Одежда', color: '#EC4899' },
    { value: 'other_expense', label: '📦 Прочие расходы', color: '#6B7280' }
  ]
};

export const CURRENCIES = [
  { value: 'RUB', label: 'Российский рубль (₽)', symbol: '₽' },
  { value: 'USD', label: 'Доллар США ($)', symbol: '$' },
  { value: 'EUR', label: 'Евро (€)', symbol: '€' },
  { value: 'KZT', label: 'Казахстанский тенге (₸)', symbol: '₸' }
];

export const TIME_RANGES = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Все время' }
];

export const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: '👶 Начинающий', color: '#10B981' },
  { value: 'intermediate', label: '🎯 Средний', color: '#F59E0B' },
  { value: 'advanced', label: '🚀 Продвинутый', color: '#EF4444' }
];

export const FAMILY_ROLES = [
  { value: 'admin', label: '👑 Администратор' },
  { value: 'member', label: '👥 Участник' }
];

// Целевые показатели для финансового здоровья
export const FINANCIAL_HEALTH_TARGETS = {
  SAVINGS_RATE: 20, // 20% от дохода
  DEBT_TO_INCOME: 35, // Не более 35%
  EMERGENCY_FUND: 6, // 6 месяцев расходов
  RETIREMENT_SAVINGS_RATE: 15 // 15% на пенсию
};

// Рекомендации по распределению бюджета
export const BUDGET_RECOMMENDATIONS = {
  503020: {
    needs: 50,
    wants: 30,
    savings: 20
  },
  604020: {
    needs: 60,
    wants: 20,
    savings: 20
  }
};

export const DEFAULT_FAMILY_SETTINGS = {
  allowMemberInvites: true,
  requireApproval: false,
  budgetNotifications: true,
  transactionNotifications: true,
  reportFrequency: 'weekly'
};