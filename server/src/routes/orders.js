const router = require('express').Router();
const Order = require('../models/Order');
const Resource = require('../models/Resource');
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.use(protect);

// Farmer: own orders. Admin: all orders.
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
  res.json(await Order.find(filter).populate('owner', 'name email').sort('-createdAt'));
}));

// Prices are read from the database, never trusted from the client.
router.post('/', asyncHandler(async (req, res) => {
  const { items = [], address } = req.body;
  if (!items.length) return res.status(400).json({ message: 'Add at least one item' });
  const lines = [];
  let total = 0;
  for (const it of items) {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const resource = await Resource.findById(it.resource);
    if (!resource) return res.status(400).json({ message: 'Item not found' });
    if (resource.stock < qty) return res.status(400).json({ message: `Only ${resource.stock} ${resource.unit} of ${resource.name} left` });
    lines.push({ resource: resource._id, name: resource.name, price: resource.price, quantity: qty });
    total += resource.price * qty;
  }
  for (const l of lines) await Resource.updateOne({ _id: l.resource }, { $inc: { stock: -l.quantity } });
  const order = await Order.create({ owner: req.user._id, items: lines, total, address });
  res.status(201).json(order);
}));

// Farmer can cancel own pending order
router.patch('/:id/cancel', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, owner: req.user._id });
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
  order.status = 'cancelled';
  await order.save();
  for (const l of order.items) await Resource.updateOne({ _id: l.resource }, { $inc: { stock: l.quantity } });
  res.json(order);
}));

// Admin: approve / ship / deliver
router.patch('/:id/status', restrictTo('admin'), asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  order.status = req.body.status;
  await order.save();
  res.json(order);
}));

module.exports = router;
