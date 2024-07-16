const asyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");

const createNotification = asyncHandler(async (req, res) => {
	const { recipient, content, chat } = req.body;

	if (!recipient || !content || !chat) {
		console.log("Invalid data passed into request");
		return res.sendStatus(400);
	}

	const newNotification = {
		sender: req.user._id,
		recipient,
		content,
		chat,
	};

	try {
		let notification = await Notification.create(newNotification);
		notification = await notification.populate("sender", "name avatar");
		notification = await notification.populate("chat");

		res.status(201).json(notification);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const fetchNotifications = asyncHandler(async (req, res) => {
	const notifications = await Notification.find({ user: req.user._id })
		.populate("chat")
		.populate("sender")
		.sort({ createdAt: -1 });
	res.json(notifications);
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
	const { chatId } = req.params;

	await Notification.updateMany(
		{ chat: chatId, user: req.user._id },
		{ $set: { read: true } },
	);

	res.status(200).json({ message: "Notifications marked as read" });
});

module.exports = {
	createNotification,
	fetchNotifications,
	markNotificationAsRead,
};
