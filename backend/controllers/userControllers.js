const asyncHandler = require("express-async-handler");
const io = require("socket.io")();
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const bcrypt = require("bcryptjs");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const Notification = require("../models/notificationModel");

const registerUser = asyncHandler(async (req, res) => {
	const { name, email, password, avatar } = req.body;

	if (!name || !email || !password) {
		res.status(400);
		throw new Error("Please Enter all the Feilds");
	}

	// check if the user already exists
	const userExists = await User.findOne({ email });

	if (userExists) {
		res.status(400);
		throw new Error("User already exists");
	}

	// create new user
	const user = await User.create({
		name,
		email,
		password,
		avatar,
	});

	if (user) {
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			token: generateToken(user._id),
		});
	} else {
		res.status(400);
		throw new Error("Failed to Create the User");
	}
});

const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	// check if user exists in database
	const user = await User.findOne({ email });

	//  check if user exists and password is correct
	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			token: generateToken(user._id),
		});
	} else {
		res.status(401);
		throw new Error("Invalid Email or Password");
	}
});

const allUsers = asyncHandler(async (req, res) => {
	const keyword = req.query.search
		? {
				$or: [
					{ name: { $regex: req.query.search, $options: "i" } },
					{ email: { $regex: req.query.search, $options: "i" } },
				],
			}
		: {};

	const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

	res.send(users);
});

const getOnlineUsers = asyncHandler(async (req, res) => {
	const users = await User.find({ isOnline: true }).select("-password");
	res.json(users);
});

const guestLogin = asyncHandler(async (req, res) => {
	const timestamp = Date.now();
	const guestEmail = `guest_${timestamp}@example.com`;
	const guestName = `Guest_${timestamp}`;

	const guestUser = await User.create({
		name: guestName,
		email: guestEmail,
		password: await bcrypt.hash("123456", 10),
		avatar:
			"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
		isOnline: true,
	});

	if (guestUser) {
		res.status(201).json({
			_id: guestUser._id,
			name: guestUser.name,
			email: guestUser.email,
			avatar: guestUser.avatar,
			isOnline: guestUser.isOnline,
			token: generateToken(guestUser._id),
		});
	} else {
		res.status(400);
		throw new Error("Failed to create guest user");
	}
});

const renameUser = asyncHandler(async (req, res) => {
	const { newName } = req.body;
	const userId = req.user._id;

	const updatedUser = await User.findByIdAndUpdate(
		userId,
		{ name: newName },
		{ new: true },
	).select("-password");

	if (updatedUser) {
		res.json({
			_id: updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			avatar: updatedUser.avatar,
			token: generateToken(updatedUser._id),
		});
	} else {
		res.status(404);
		throw new Error("User not found");
	}
});

const deleteGuestUser = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	try {
		const deletedUser = await User.findByIdAndDelete(userId);

		if (deletedUser) {
			await Message.deleteMany({ sender: userId });
			const deletedChats = await Chat.find({ users: userId });
			await Chat.deleteMany({ users: userId });
			await Notification.deleteMany({ user: userId });
			await Notification.deleteMany({ sender: userId });

			io.emit("guestUserDeleted", {
				userId,
				chatIds: deletedChats.map((chat) => chat._id),
			});

			res.json({
				message: "Guest user and associated data deleted successfully",
			});
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error) {
		console.error("Error deleting guest user:", error);
		res
			.status(500)
			.json({ message: "Internal server error", error: error.message });
	}
});

module.exports = {
	registerUser,
	authUser,
	allUsers,
	getOnlineUsers,
	guestLogin,
	renameUser,
	deleteGuestUser,
};
