
const router = require("express").Router();
const { getWeather } = require("../controllers/weatherController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getWeather);

module.exports = router;

