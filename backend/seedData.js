const mongoose = require("mongoose");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const seedGuestUser = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);

		const guestUser = {
			name: "Guest User",
			email: "guest@example.com",
			password: await bcrypt.hash("123456", 10),
			avatar:
				"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
		};

		await User.create(guestUser);

		console.log("Guest user seeded successfully");
		process.exit();
	} catch (error) {
		console.error("Error seeding guest user:", error);
		process.exit(1);
	}
};

seedGuestUser();
