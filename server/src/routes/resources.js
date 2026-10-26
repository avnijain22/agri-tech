const router = require('express').Router();
const Resource = require('../models/Resource');
const { protect, restrictTo } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

router.use(protect);
router.get('/', asyncHandler(async (req, res) => res.json(await Resource.find().sort('category name'))));
router.post('/', restrictTo('admin'), asyncHandler(async (req, res) => res.status(201).json(await Resource.create(req.body))));
router.put('/:id', restrictTo('admin'), asyncHandler(async (req, res) => {
  const doc = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json(doc);
}));
router.delete('/:id', restrictTo('admin'), asyncHandler(async (req, res) => {
  await Resource.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}));

module.exports = router;
