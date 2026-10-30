const Crop = require("../models/Crop");
const Farm = require("../models/Farm");

exports.createCrop = async (req, res, next) => {
  try {
    const { farm, cropName, cropType, sowingTime, harvestingTime, growthStage, notes } = req.body;
    const ownsFarm = await Farm.findOne({ _id: farm, user: req.user._id });
    if (!ownsFarm) return res.status(404).json({ message: "Farm not found" });

    const crop = await Crop.create({
      user: req.user._id, farm, cropName, cropType,
      sowingTime, harvestingTime, growthStage, notes,
    });
    res.status(201).json(crop);
  } catch (err) { next(err); }
};

exports.getMyCrops = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.farm) filter.farm = req.query.farm;
    res.json(await Crop.find(filter).populate("farm", "farmName location").sort("-createdAt"));
  } catch (err) { next(err); }
};

exports.updateCrop = async (req, res, next) => {
  try {
    const { cropName, cropType, sowingTime, harvestingTime, growthStage, notes } = req.body;
    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { cropName, cropType, sowingTime, harvestingTime, growthStage, notes },
      { new: true, runValidators: true }
    );
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json(crop);
  } catch (err) { next(err); }
};

exports.deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!crop) return res.status(404).json({ message: "Crop not found" });
    res.json({ message: "Crop deleted" });
  } catch (err) { next(err); }
};
