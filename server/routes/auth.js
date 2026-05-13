const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const signToken = (user, groupId) =>
  jwt.sign(
    { userId: user._id.toString(), groupId, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// POST /api/auth/setup  — create group + admin + members
router.post('/setup', async (req, res) => {
  try {
    const { groupId, groupName, groupImage, adminName, adminPassword, members } = req.body;

    const id = groupId.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (id.length < 3 || id.length > 30) {
      return res.status(400).json({ message: 'Group ID must be 3-30 characters (letters, numbers, hyphens).' });
    }

    const existing = await Group.findOne({ groupId: id });
    if (existing) return res.status(400).json({ message: 'Group ID already exists.' });

    if (!adminPassword || adminPassword.length < 6) {
      return res.status(400).json({ message: 'Admin password must be at least 6 characters.' });
    }

    const group = await Group.create({ groupId: id, groupName: groupName || id, groupImage: groupImage || '' });

    const hashedAdminPw = await bcrypt.hash(adminPassword, 10);
    const admin = await User.create({
      groupId: id, name: adminName.trim(), password: hashedAdminPw, role: 'admin',
    });

    if (members && members.length > 0) {
      for (const m of members) {
        const hashed = await bcrypt.hash(m.pin || '123456', 10);
        await User.create({ groupId: id, name: m.name.trim(), password: hashed, role: 'member' });
      }
    }

    const token = signToken(admin, id);
    res.status(201).json({ token, user: { _id: admin._id, name: admin.name, role: 'admin', groupId: id }, group });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Duplicate group or user name.' });
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { groupId, name, password } = req.body;
    if (!groupId || !name || !password) {
      return res.status(400).json({ message: 'Group ID, name, and password are required.' });
    }

    const gid = groupId.toLowerCase().trim();
    const group = await Group.findOne({ groupId: gid });
    if (!group) return res.status(400).json({ message: 'Group not found.' });

    const user = await User.findOne({ groupId: gid, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (!user) return res.status(400).json({ message: 'Invalid name or password.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid name or password.' });

    const token = signToken(user, gid);
    res.json({
      token,
      user: { _id: user._id, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone, groupId: gid },
      group: { groupId: group.groupId, groupName: group.groupName, groupImage: group.groupImage },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register — self-register member into a group
router.post('/register', async (req, res) => {
  try {
    const { groupId, name, pin } = req.body;
    const gid = groupId.toLowerCase().trim();

    const group = await Group.findOne({ groupId: gid });
    if (!group) return res.status(400).json({ message: 'Group not found.' });

    const dup = await User.findOne({ groupId: gid, name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (dup) return res.status(400).json({ message: 'Name already taken in this group.' });

    if (!pin || pin.length < 4) return res.status(400).json({ message: 'PIN must be at least 4 characters.' });

    const hashed = await bcrypt.hash(pin, 10);
    const user = await User.create({ groupId: gid, name: name.trim(), password: hashed, role: 'member' });

    const token = signToken(user, gid);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, role: user.role, groupId: gid },
      group: { groupId: group.groupId, groupName: group.groupName, groupImage: group.groupImage },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me — get current user from token
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const group = await Group.findOne({ groupId: req.groupId });
    res.json({
      user: { _id: user._id, name: user.name, role: user.role, avatar: user.avatar, phone: user.phone, groupId: req.groupId },
      group: group ? { groupId: group.groupId, groupName: group.groupName, groupImage: group.groupImage } : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
