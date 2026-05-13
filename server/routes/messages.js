const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/messages?limit=50
router.get('/', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const messages = await Message.find({ groupId: req.groupId })
      .sort({ createdAt: 1 })
      .limit(limit);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages
router.post('/', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text required.' });
    const msg = await Message.create({
      groupId: req.groupId,
      text: text.trim(),
      userId: req.user.userId,
      userName: req.user.name,
      userAvatar: '',
      readBy: [req.user.userId],
    });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/messages/read — mark messages as read
router.put('/read', auth, async (req, res) => {
  try {
    await Message.updateMany(
      { groupId: req.groupId, readBy: { $ne: req.user.userId } },
      { $addToSet: { readBy: req.user.userId } }
    );
    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
