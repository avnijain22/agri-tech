
const router = require("express").Router();
const c = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, c.getProducts);
router.post("/", protect, adminOnly, c.createProduct);
router.route("/:id").put(protect, adminOnly, c.updateProduct).delete(protect, adminOnly, c.deleteProduct);

module.exports = router;

