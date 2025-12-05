import { useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  familyMemberId?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  receipt?: string;
  recurring?: boolean;
  recurringId?: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budget?: number;
  isActive: boolean;
  createdAt: string;
}

export interface TransactionFilters {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  familyMemberId?: string;
  tags?: string[];
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionsCount: number;
  averageTransaction: number;
  largestTransaction: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  average: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  transactionsCount: number;
}

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextOccurrence: string;
  familyMemberId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TransactionImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  duplicates: number;
}

export interface FinancialSummary {
  totalBudget: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  savings: number;
  growthPercentage: number;
  month: string;
  year: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получение финансовой сводки
  const fetchFinancialSummary = async (month?: string, year?: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      
      const response = await fetch(`http://localhost:3001/api/transactions/summary?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch financial summary');
      
      const data = await response.json();
      setSummary(data.summary);
      return data.summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Получение транзакций
  const fetchTransactions = async (filters?: TransactionFilters) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`http://localhost:3001/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      setTransactions(data.transactions);
      return data.transactions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Добавление транзакции
  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      });
      
      if (!response.ok) throw new Error('Failed to add transaction');
      
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Обновляем сводку после добавления транзакции
      await fetchFinancialSummary();
      
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Получение статистики
  const fetchStats = async (filters?: TransactionFilters) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }
      
      const response = await fetch(`http://localhost:3001/api/transactions/stats?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  };

  useEffect(() => {
    // Загружаем данные при монтировании
    fetchTransactions();
    fetchFinancialSummary();
    fetchStats();
  }, []);

  return {
    transactions,
    stats,
    summary,
    loading,
    error,
    addTransaction,
    fetchTransactions,
    fetchFinancialSummary,
    fetchStats,
    refreshData: () => {
      fetchTransactions();
      fetchFinancialSummary();
      fetchStats();
    }
  };
};