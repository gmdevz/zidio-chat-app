const express = require("express");
const {
	registerUser,
	authUser,
	allUsers,
	guestLogin,
	renameUser,
	getOnlineUsers,
	deleteGuestUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Registration endpoint
router.route("/").post(registerUser).get(protect, allUsers);
// Login endpoint
router.post("/login", authUser);

router.get("/online", protect, getOnlineUsers);

router.post("/guestlogin", guestLogin);

router.put("/rename", protect, renameUser);

router.delete("/guestlogout", protect, deleteGuestUser);

module.exports = router;
