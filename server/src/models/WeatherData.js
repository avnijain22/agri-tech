const mongoose = require('mongoose');

// Cached forecast per farm so we do not hammer the weather API
module.exports = mongoose.model('WeatherData', new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, unique: true },
  fetchedAt: { type: Date, default: Date.now },
  payload: mongoose.Schema.Types.Mixed
}));
