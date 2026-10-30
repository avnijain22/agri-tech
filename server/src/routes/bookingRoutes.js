
const router = require("express").Router();
const c = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect);
router.post("/", c.createBooking);
router.get("/my", c.getMyBookings);
router.get("/", adminOnly, c.getAllBookings);
router.put("/:id/status", adminOnly, c.updateBookingStatus);

module.exports = router;

