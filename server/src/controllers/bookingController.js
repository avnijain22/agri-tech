const Booking = require("../models/Booking");
const Product = require("../models/Product");

// POST /api/bookings  (buy a resource)
exports.createBooking = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({ message: "Quantity must be a whole number of at least 1" });
    }

    // Atomic stock decrement: only succeeds if enough stock remains
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: qty } },
      { $inc: { stock: -qty } },
      { new: true }
    );
    if (!product) return res.status(400).json({ message: "Product not found or insufficient stock" });

    const booking = await Booking.create({
      user: req.user._id,
      product: product._id,
      quantity: qty,
      totalAmount: product.price * qty,
    });
    res.status(201).json(booking);
  } catch (err) { next(err); }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
  try {
    res.json(
      await Booking.find({ user: req.user._id })
        .populate("product", "name category price")
        .sort("-createdAt")
    );
  } catch (err) { next(err); }
};

// GET /api/bookings  (admin: all bookings)
exports.getAllBookings = async (req, res, next) => {
  try {
    res.json(
      await Booking.find()
        .populate("user", "name email")
        .populate("product", "name price")
        .sort("-createdAt")
    );
  } catch (err) { next(err); }
};

// PUT /api/bookings/:id/status  (admin: approve / deliver / cancel)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pending", "approved", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Return stock if an active booking gets cancelled
    if (status === "cancelled" && booking.status !== "cancelled") {
      await Product.findByIdAndUpdate(booking.product, { $inc: { stock: booking.quantity } });
    }
    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (err) { next(err); }
};
