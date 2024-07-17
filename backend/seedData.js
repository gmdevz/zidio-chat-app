const mongoose = require("mongoose");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const seedGuestUser = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);

		const existingUser = await User.findOne({ email: "guest@example.com" });
		if (!existingUser) {
			const guestUser = new User({
				name: "Guest User",
				email: `guest_${Date.now()}@example.com`,
				password: await bcrypt.hash("guestpassword", 10),
				isGuest: true,
			});
			await guestUser.save();
			console.log("Guest user seeded successfully");
		} else {
			console.log("Guest user already exists");
		}
	} catch (error) {
		console.error("Error seeding guest user:", error);
	}
};

seedGuestUser();
