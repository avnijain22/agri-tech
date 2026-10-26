const express = require('express');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

// Builds CRUD routes scoped to the logged-in owner (admins can see everything).
module.exports = function ownerCrud(Model, { populate = '', allowed = [], validators = [] } = {}) {
  const router = express.Router();
  router.use(protect);
  const pick = body => allowed.length ? Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k))) : body;
  const scope = req => (req.user.role === 'admin' ? {} : { owner: req.user._id });

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await Model.find(scope(req)).populate(populate).sort('-createdAt'));
  }));

  router.post('/', validators, require('../middleware/validate'), asyncHandler(async (req, res) => {
    res.status(201).json(await Model.create({ ...pick(req.body), owner: req.user._id }));
  }));

  router.get('/:id', asyncHandler(async (req, res) => {
    const doc = await Model.findOne({ _id: req.params.id, ...scope(req) }).populate(populate);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  }));

  router.put('/:id', asyncHandler(async (req, res) => {
    const doc = await Model.findOne({ _id: req.params.id, ...scope(req) });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.set(pick(req.body));
    await doc.save();
    res.json(doc);
  }));

  router.delete('/:id', asyncHandler(async (req, res) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id, ...scope(req) });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  }));

  return router;
};
