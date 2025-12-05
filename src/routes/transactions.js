const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/transactions/summary - Получение финансовой сводки
router.get('/summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;
    
    const currentMonth = parseInt(month) || new Date().getMonth() + 1;
    const currentYear = parseInt(year) || new Date().getFullYear();
    
    // Получаем транзакции пользователя за указанный месяц
    const transactions = await Transaction.find({
      userId,
      date: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1)
      }
    });
    
    const monthlyIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Получаем бюджет пользователя
    const user = await User.findById(userId);
    const totalBudget = user?.budget || 0;
    
    const savings = Math.max(0, monthlyIncome - monthlyExpenses);
    
    // Расчет роста (сравнение с предыдущим месяцем)
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    
    const previousTransactions = await Transaction.find({
      userId,
      date: {
        $gte: new Date(previousYear, previousMonth - 1, 1),
        $lt: new Date(previousYear, previousMonth, 1)
      }
    });
    
    const previousIncome = previousTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const growthPercentage = previousIncome > 0 
      ? Math.round(((monthlyIncome - previousIncome) / previousIncome) * 100)
      : monthlyIncome > 0 ? 100 : 0;
    
    const summary = {
      totalBudget,
      monthlyExpenses,
      monthlyIncome,
      savings,
      growthPercentage,
      month: currentMonth.toString(),
      year: currentYear.toString()
    };
    
    res.json({ summary });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

// GET /api/transactions - Получение всех транзакций
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, search } = req.query;
    const userId = req.user.id;
    
    let filter = { userId };
    
    if (type && type !== 'all') filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(100);
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/transactions - Создание новой транзакции
router.post('/', auth, async (req, res) => {
  try {
    const { amount, type, category, description, date, familyMemberId, tags } = req.body;
    const userId = req.user.id;
    
    const transaction = new Transaction({
      amount,
      type,
      category,
      description,
      date: new Date(date),
      userId,
      familyMemberId,
      tags
    });
    
    await transaction.save();
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

module.exports = router;