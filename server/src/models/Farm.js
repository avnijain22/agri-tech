const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    farmName: { type: String, required: true },
    farmSize: { type: Number, required: true }, // in acres
    location: { type: String, required: true }, // city/district, used for weather
    soilType: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);
