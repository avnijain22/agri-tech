const mongoose = require('mongoose');

// Items farmers can buy: seeds, fertilizer, tools...
module.exports = mongoose.model('Resource', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, enum: ['seeds', 'fertilizer', 'pesticide', 'tools', 'other'], default: 'other' },
  description: String,
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'unit' },
  stock: { type: Number, default: 0, min: 0 }
}, { timestamps: true }));
