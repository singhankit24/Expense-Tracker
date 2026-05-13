const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  groupId:    { type: String, required: true, index: true },
  text:       { type: String, required: true },
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  userAvatar: { type: String, default: '' },
  readBy:     [{ type: String }],
  createdAt:  { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
