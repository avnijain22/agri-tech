const mongoose = require('mongoose');

const soilSchema = new mongoose.Schema({
  ph: { type: Number, min: 0, max: 14 },
  nitrogen: Number,      // kg/ha
  phosphorus: Number,    // kg/ha
  potassium: Number,     // kg/ha
  organicCarbon: Number, // %
  testedOn: { type: Date, default: Date.now }
}, { _id: false });

module.exports = mongoose.model('Crop', new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  name: { type: String, required: true, trim: true },
  variety: String,
  season: { type: String, enum: ['kharif', 'rabi', 'zaid'], default: 'kharif' },
  sowingDate: Date,
  expectedHarvest: Date,
  areaAcres: { type: Number, min: 0 },
  status: { type: String, enum: ['planned', 'growing', 'harvested', 'failed'], default: 'planned' },
  expectedYield: Number,
  actualYield: Number,
  soil: soilSchema,
  activityLog: [{ date: { type: Date, default: Date.now }, action: String, note: String }]
}, { timestamps: true }));
