const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  share:  { type: Number, required: true },
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  groupId:      { type: String, required: true, index: true },
  description:  { type: String, required: true, trim: true },
  amount:       { type: Number, required: true },
  payerId:      { type: String, required: true },       // ObjectId as string, or 'wallet'
  date:         { type: Date, default: Date.now },
  tags:         [{ type: String, trim: true, lowercase: true }],
  participants: [participantSchema],
  createdAt:    { type: Date, default: Date.now },
});

module.exports = mongoose.model('Expense', expenseSchema);
