const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    cropType: {
      type: String,
      enum: ["cereal", "pulse", "vegetable", "fruit", "oilseed", "other"],
      default: "other",
    },
    sowingTime: {
      type: Date,
      required: true,
    },
    harvestingTime: {
      type: Date,
      required: true,
    },
    growthStage: {
      type: String,
      enum: ["sowing", "growing", "flowering", "harvesting", "harvested"],
      default: "sowing",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
