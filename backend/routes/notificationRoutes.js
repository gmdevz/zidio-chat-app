const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
	createNotification,
	fetchNotifications,
	markNotificationAsRead,
} = require("../controllers/notificationControllers");

const router = express.Router();

router.route("/").post(protect, createNotification);
router.route("/").get(protect, fetchNotifications);
router.route("/:notificationId").put(protect, markNotificationAsRead);
router.route("/markAsRead/:chatId").put(protect, markNotificationAsRead);

module.exports = router;
