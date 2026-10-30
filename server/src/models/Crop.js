const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farm: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
    cropName: { type: String, required: true },
    cropType: { type: String }, // e.g. cereal, pulse, vegetable
    sowingTime: { type: Date },
    harvestingTime: { type: Date },
    growthStage: {
      type: String,
      enum: ["sowing", "growing", "flowering", "harvesting", "harvested"],
      default: "sowing",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
