const Product = require("../models/Product");

// Public to logged-in users
exports.getProducts = async (req, res, next) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    res.json(await Product.find(filter).sort("name"));
  } catch (err) { next(err); }
};

// Admin only (enforced in routes)
exports.createProduct = async (req, res, next) => {
  try {
    const { name, category, description, price, stock } = req.body;
    res.status(201).json(await Product.create({ name, category, description, price, stock }));
  } catch (err) { next(err); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, category, description, price, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, description, price, stock },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) { next(err); }
};
