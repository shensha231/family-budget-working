// Валидаторы для форм

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email обязателен';
  if (!emailRegex.test(email)) return 'Некорректный email';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Пароль обязателен';
  if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
  if (!/(?=.*[a-z])/.test(password)) return 'Пароль должен содержать строчную букву';
  if (!/(?=.*[A-Z])/.test(password)) return 'Пароль должен содержать заглавную букву';
  if (!/(?=.*\d)/.test(password)) return 'Пароль должен содержать цифру';
  if (!/(?=.*[!@#$%^&*])/.test(password)) return 'Пароль должен содержать специальный символ';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Имя обязательно';
  if (name.length < 2) return 'Имя должно содержать минимум 2 символа';
  if (name.length > 50) return 'Имя не должно превышать 50 символов';
  return null;
};

export const validateAmount = (amount: string): string | null => {
  const numAmount = parseFloat(amount);
  if (!amount) return 'Сумма обязательна';
  if (isNaN(numAmount)) return 'Сумма должна быть числом';
  if (numAmount <= 0) return 'Сумма должна быть положительной';
  if (numAmount > 1000000000) return 'Сумма слишком большая';
  return null;
};

export const validateCategory = (category: string): string | null => {
  if (!category) return 'Категория обязательна';
  return null;
};

export const validateDate = (date: string): string | null => {
  if (!date) return 'Дата обязательна';
  const inputDate = new Date(date);
  const today = new Date();
  if (inputDate > today) return 'Дата не может быть в будущем';
  return null;
};

export const validateFamilyName = (name: string): string | null => {
  if (!name) return 'Название семьи обязательно';
  if (name.length < 2) return 'Название должно содержать минимум 2 символа';
  if (name.length > 100) return 'Название не должно превышать 100 символов';
  return null;
};

export const validateBudget = (budget: number): string | null => {
  if (budget === undefined || budget === null) return 'Бюджет обязателен';
  if (budget < 0) return 'Бюджет не может быть отрицательным';
  if (budget > 1000000000) return 'Бюджет слишком большой';
  return null;
};

// Композитные валидаторы
export const validateTransaction = (data: {
  amount: string;
  category: string;
  description: string;
  date: string;
}) => {
  const errors: { [key: string]: string } = {};

  const amountError = validateAmount(data.amount);
  if (amountError) errors.amount = amountError;

  const categoryError = validateCategory(data.category);
  if (categoryError) errors.category = categoryError;

  if (!data.description) errors.description = 'Описание обязательно';

  const dateError = validateDate(data.date);
  if (dateError) errors.date = dateError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateUserRegistration = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const errors: { [key: string]: string } = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Пароли не совпадают';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};