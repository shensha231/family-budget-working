// Форматирование денежных значений
export const formatCurrency = (
  amount: number, 
  currency: string = 'RUB', 
  locale: string = 'ru-RU'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  return formatter.format(amount);
};

// Форматирование процентов
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Форматирование даты
export const formatDate = (dateString: string, format: 'short' | 'long' = 'short'): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = format === 'short' 
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'long', year: 'numeric' };

  return date.toLocaleDateString('ru-RU', options);
};

// Форматирование относительного времени
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяцев назад`;
  
  return `${Math.floor(diffDays / 365)} лет назад`;
};

// Сокращение больших чисел
export const abbreviateNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Форматирование времени чтения
export const formatReadTime = (minutes: number): string => {
  if (minutes < 1) return 'Меньше минуты';
  if (minutes === 1) return '1 минута';
  if (minutes < 5) return `${minutes} минуты`;
  return `${minutes} минут`;
};

// Форматирование категории
export const formatCategory = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    'food': 'Продукты',
    'transport': 'Транспорт',
    'entertainment': 'Развлечения',
    'housing': 'Жилье',
    'health': 'Здоровье',
    'education': 'Образование',
    'other': 'Прочее',
    'salary': 'Зарплата',
    'freelance': 'Фриланс',
    'investment': 'Инвестиции',
    'gifts': 'Подарки'
  };

  return categoryMap[category.toLowerCase()] || category;
};