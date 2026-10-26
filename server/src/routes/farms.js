const { body } = require('express-validator');
const Farm = require('../models/Farm');
const ownerCrud = require('../utils/ownerCrud');

module.exports = ownerCrud(Farm, {
  allowed: ['name', 'location', 'latitude', 'longitude', 'areaAcres', 'soilType', 'irrigation'],
  validators: [
    body('name').trim().notEmpty().withMessage('Farm name is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180')
  ]
});
