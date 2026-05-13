const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupId:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  groupName:  { type: String, required: true, trim: true },
  groupImage: { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Group', groupSchema);
