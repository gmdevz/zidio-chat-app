const express = require("express");
const {
	registerUser,
	authUser,
	allUsers,
} = require("../controllers/userControllers");

const router = express.Router();

// // Registration endpoint
// router.route("/").post(registerUser).get(allUsers);
// // Login endpoint
// router.post("/login", authUser);

module.exports = router;
