const mongoose = require('mongoose');

module.exports = mongoose.model('Farm', new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  latitude: { type: Number, min: -90, max: 90, required: true },
  longitude: { type: Number, min: -180, max: 180, required: true },
  areaAcres: { type: Number, min: 0, default: 1 },
  soilType: { type: String, enum: ['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy', 'clay'], default: 'loamy' },
  irrigation: { type: String, enum: ['rainfed', 'canal', 'borewell', 'drip', 'sprinkler'], default: 'rainfed' }
}, { timestamps: true }));
