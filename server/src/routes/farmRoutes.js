
const router = require("express").Router();
const c = require("../controllers/farmController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);
router.route("/").get(c.getMyFarms).post(c.createFarm);
router.route("/:id").put(c.updateFarm).delete(c.deleteFarm);
module.exports = router;

