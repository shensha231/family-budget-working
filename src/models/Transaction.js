const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyMemberId: {
    type: String
  },
  tags: [String],
  receipt: String,
  recurring: {
    type: Boolean,
    default: false
  },
  recurringId: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);