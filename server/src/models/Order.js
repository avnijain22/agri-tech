const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  name: String,
  price: Number,
  quantity: { type: Number, min: 1, default: 1 }
}, { _id: false });

module.exports = mongoose.model('Order', new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [itemSchema], validate: v => v.length > 0 },
  total: Number,
  status: { type: String, enum: ['pending', 'approved', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  address: String
}, { timestamps: true }));
