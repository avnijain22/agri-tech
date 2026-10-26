const { body } = require('express-validator');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const ownerCrud = require('../utils/ownerCrud');
const { analyzeSoil } = require('../utils/agronomy');
const { asyncHandler } = require('../middleware/error');

const router = ownerCrud(Crop, {
  populate: 'farm',
  allowed: ['farm', 'name', 'variety', 'season', 'sowingDate', 'expectedHarvest', 'areaAcres', 'status', 'expectedYield', 'actualYield', 'soil'],
  validators: [
    body('name').trim().notEmpty().withMessage('Crop name is required'),
    body('farm').isMongoId().withMessage('Choose a farm'),
    body('farm').custom(async (id, { req }) => {
      const farm = await Farm.findById(id);
      if (!farm || (String(farm.owner) !== String(req.user._id) && req.user.role !== 'admin')) throw new Error('Farm not found');
      return true;
    })
  ]
});

// Soil health analysis for one crop's latest soil test
router.get('/:id/analysis', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.user._id };
  const crop = await Crop.findOne(filter);
  if (!crop) return res.status(404).json({ message: 'Not found' });
  res.json(analyzeSoil(crop.soil ? crop.soil.toObject() : {}));
}));

// Add an entry to the activity log (sowing, irrigation, spraying...)
router.post('/:id/activity', asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, owner: req.user._id };
  const crop = await Crop.findOne(filter);
  if (!crop) return res.status(404).json({ message: 'Not found' });
  crop.activityLog.push({ action: req.body.action, note: req.body.note });
  await crop.save();
  res.status(201).json(crop);
}));

module.exports = router;
