const router = require('express').Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Post = require('../models/Post');
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.use(protect, restrictTo('admin'));

router.get('/stats', asyncHandler(async (req, res) => {
  const [users, farms, crops, orders, openConsults, revenue] = await Promise.all([
    User.countDocuments(), Farm.countDocuments(), Crop.countDocuments(), Order.countDocuments(),
    Post.countDocuments({ type: 'consultation', status: 'open' }),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }])
  ]);
  res.json({ users, farms, crops, orders, openConsults, revenue: revenue[0]?.total || 0 });
}));

router.get('/users', asyncHandler(async (req, res) => res.json(await User.find().select('-password').sort('-createdAt'))));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) return res.status(400).json({ message: 'You cannot change your own role or status' });
  const update = {};
  if (['farmer', 'admin', 'expert'].includes(req.body.role)) update.role = req.body.role;
  if (typeof req.body.active === 'boolean') update.active = req.body.active;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
}));

module.exports = router;
