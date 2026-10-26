const router = require('express').Router();
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.get('/', protect, asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const [farms, crops, orders] = await Promise.all([
    Farm.find({ owner }), Crop.find({ owner }), Order.find({ owner }).sort('-createdAt').limit(5)
  ]);
  const byStatus = {};
  const yieldByCrop = [];
  for (const c of crops) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    if (c.expectedYield || c.actualYield) yieldByCrop.push({ name: c.name, expected: c.expectedYield || 0, actual: c.actualYield || 0 });
  }
  res.json({
    totals: { farms: farms.length, crops: crops.length, acres: farms.reduce((s, f) => s + (f.areaAcres || 0), 0), orders: orders.length },
    cropStatus: Object.entries(byStatus).map(([name, value]) => ({ name, value })),
    yieldByCrop, recentOrders: orders
  });
}));

module.exports = router;
