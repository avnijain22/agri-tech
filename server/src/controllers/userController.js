const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    res.json(await User.find().select("-password").sort("-createdAt"));
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) { next(err); }
};
