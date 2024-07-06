const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
	accessChat,
	fetchChats,
	createGroupChats,
	renameGroup,
	addToGroup,
	removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
// creating a group
router.route("/group").post(protect, createGroupChats);
// rename group
router.route("/rename").put(protect, renameGroup);
// add someone to group
router.route("/groupadd").put(protect, addToGroup);
// remove someone from group
router.route("/groupremove").put(protect, removeFromGroup);

module.exports = router;
