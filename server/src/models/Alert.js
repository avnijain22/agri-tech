const mongoose = require('mongoose');

// Admin-published pest / advisory alerts
module.exports = mongoose.model('Alert', new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'warning' },
  crop: String,
  active: { type: Boolean, default: true }
}, { timestamps: true }));
