const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/users — list all users in group
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ groupId: req.groupId })
      .select('-password')
      .sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile — update own profile
router.put('/profile', auth, async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name.trim();
    if (req.body.phone !== undefined) update.phone = req.body.phone;
    if (req.body.avatar !== undefined) update.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/password — change own password
router.put('/password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters.' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { password: hashed });
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/group-image — update group image (admin only)
router.put('/group-image', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
    await Group.findOneAndUpdate({ groupId: req.groupId }, { groupImage: req.body.groupImage || '' });
    res.json({ message: 'Group image updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
