
const router = require("express").Router();
const { getUsers, deleteUser } = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);
router.get("/", getUsers);
router.delete("/:id", deleteUser);

module.exports = router;

