
const router = require("express").Router();
const c = require("../controllers/cropController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.route("/").get(c.getMyCrops).post(c.createCrop);
router.route("/:id").put(c.updateCrop).delete(c.deleteCrop);

module.exports = router;

