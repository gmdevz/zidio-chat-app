const express = require("express");
const { registerUser, authUser } = require("../controllers/userControllers");

const router = express.Router();

// Registration endpoint
router.route("/").post(registerUser);
// Login endpoint
router.post("/login", authUser);

module.exports = router;
