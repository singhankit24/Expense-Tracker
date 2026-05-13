const express = require('express');
const Contribution = require('../models/Contribution');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/contributions?limit=20&skip=0
router.get('/', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;
    const contributions = await Contribution.find({ groupId: req.groupId })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip).limit(limit);
    const total = await Contribution.countDocuments({ groupId: req.groupId });
    res.json({ contributions, total, hasMore: skip + limit < total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/contributions
router.post('/', auth, async (req, res) => {
  try {
    const { contributorId, amount } = req.body;
    if (!contributorId || !amount) {
      return res.status(400).json({ message: 'Contributor and amount required.' });
    }
    const contribution = await Contribution.create({
      groupId: req.groupId, contributorId, amount, date: new Date(),
    });
    res.status(201).json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/contributions/:id
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const update = {};
    if (req.body.amount) update.amount = req.body.amount;
    if (req.body.contributorId) update.contributorId = req.body.contributorId;
    const contribution = await Contribution.findOneAndUpdate(
      { _id: req.params.id, groupId: req.groupId }, update, { new: true }
    );
    if (!contribution) return res.status(404).json({ message: 'Not found.' });
    res.json(contribution);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/contributions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    const result = await Contribution.findOneAndDelete({ _id: req.params.id, groupId: req.groupId });
    if (!result) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
