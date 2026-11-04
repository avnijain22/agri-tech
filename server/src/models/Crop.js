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
    },
    sowingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: {
      type: Date,
      required: true,
    },
    growthStage: {
      type: String,
      default: "Sown",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);