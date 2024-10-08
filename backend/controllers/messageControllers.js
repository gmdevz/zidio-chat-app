const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Notification = require("../models/notificationModel");

const sendMessage = asyncHandler(async (req, res) => {
	const { content, chatId } = req.body;

	if (!content || !chatId) {
		console.log("Invalid data passed into request");
		return res.sendStatus(400);
	}

	const newMessage = {
		sender: req.user._id,
		content: content,
		chat: chatId,
	};

	try {
		let message = await Message.create(newMessage);

		message = await message.populate("sender", "name avatar");
		message = await message.populate("chat");
		message = await User.populate(message, {
			path: "chat.users",
			select: "name avatar email",
		});

		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message,
		});

		// Create notifications for all users in the chat except the sender
		const chat = await Chat.findById(chatId);
		chat.users.forEach(async (userId) => {
			if (userId.toString() !== req.user._id.toString()) {
				await Notification.create({
					sender: req.user._id,
					recipient: userId,
					content: `New message from ${req.user.name}`,
					chat: chatId,
				});
			}
		});

		res.json(message);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const allMessages = asyncHandler(async (req, res) => {
	try {
		const messages = await Message.find({ chat: req.params.chatId })
			.populate("sender", "name avatar email")
			.populate("chat");
		res.json(messages);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

module.exports = { sendMessage, allMessages };
