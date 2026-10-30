const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["seeds", "fertilizers", "pesticides", "equipment"],
      required: true,
    },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
