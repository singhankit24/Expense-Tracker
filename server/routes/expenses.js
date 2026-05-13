const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/expenses?limit=20&skip=0
router.get('/', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;
    const expenses = await Expense.find({ groupId: req.groupId })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip).limit(limit);
    const total = await Expense.countDocuments({ groupId: req.groupId });
    res.json({ expenses, total, hasMore: skip + limit < total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/expenses
router.post('/', auth, async (req, res) => {
  try {
    const { description, amount, payerId, date, tags, participants } = req.body;
    if (!description || !amount || !participants?.length) {
      return res.status(400).json({ message: 'Description, amount, and participants are required.' });
    }
    const share = amount / participants.length;
    const expense = await Expense.create({
      groupId: req.groupId,
      description: description.trim(),
      amount,
      payerId: payerId || 'wallet',
      date: date ? new Date(date) : new Date(),
      tags: tags || [],
      participants: participants.map(id => ({ userId: id, share })),
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/expenses/:id
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const { description, amount, payerId, date } = req.body;
    const expense = await Expense.findOne({ _id: req.params.id, groupId: req.groupId });
    if (!expense) return res.status(404).json({ message: 'Expense not found.' });

    if (description) expense.description = description.trim();
    if (amount) {
      expense.amount = amount;
      if (expense.participants.length > 0) {
        const share = amount / expense.participants.length;
        expense.participants = expense.participants.map(p => ({ ...p.toObject(), share }));
      }
    }
    if (payerId) expense.payerId = payerId;
    if (date) expense.date = new Date(date);

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const result = await Expense.findOneAndDelete({ _id: req.params.id, groupId: req.groupId });
    if (!result) return res.status(404).json({ message: 'Expense not found.' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
