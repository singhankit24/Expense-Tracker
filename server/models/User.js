const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  groupId:  { type: String, required: true, index: true },
  name:     { type: String, required: true, trim: true },
  avatar:   { type: String, default: '' },
  password: { type: String, required: true },          // bcrypt hash
  role:     { type: String, enum: ['admin', 'member'], default: 'member' },
  phone:    { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now },
});

userSchema.index({ groupId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
