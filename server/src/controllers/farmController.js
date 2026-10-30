const Farm = require("../models/Farm");

exports.createFarm = async (req, res, next) => {
  try {
    const { farmName, farmSize, location, soilType } = req.body;
    const farm = await Farm.create({
      user: req.user._id, farmName, farmSize, location, soilType,
    });
    res.status(201).json(farm);
  } catch (err) { next(err); }
};

exports.getMyFarms = async (req, res, next) => {
  try {
    res.json(await Farm.find({ user: req.user._id }).sort("-createdAt"));
  } catch (err) { next(err); }
};

exports.updateFarm = async (req, res, next) => {
  try {
    const { farmName, farmSize, location, soilType } = req.body;
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { farmName, farmSize, location, soilType },
      { new: true, runValidators: true }
    );
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.json(farm);
  } catch (err) { next(err); }
};

exports.deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.json({ message: "Farm deleted" });
  } catch (err) { next(err); }
};
