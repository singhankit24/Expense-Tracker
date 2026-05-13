const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  groupId:       { type: String, required: true, index: true },
  contributorId: { type: String, required: true },       // User ObjectId as string
  amount:        { type: Number, required: true },
  date:          { type: Date, default: Date.now },
  createdAt:     { type: Date, default: Date.now },
});

module.exports = mongoose.model('Contribution', contributionSchema);
