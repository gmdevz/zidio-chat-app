const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		res.status(400);
		console.log("UserId is required");
	}

	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate("users", "-password")
		.populate("latestMessage");

	isChat = await User.populate(isChat, {
		path: "latestMessage.sender",
		select: "name avatar email",
	});

	if (isChat.length > 0) {
		res.send(isChat[0]);
	} else {
		const chatData = {
			chatName: "sender",
			isGroupChat: false,
			users: [req.user._id, userId],
		};
		try {
			const newChat = await Chat.create(chatData);

			const fullChat = await Chat.findOne({
				_id: newChat._id,
			}).populate("users", "-password");

			res.status(200).send(fullChat);
		} catch (error) {
			res.status(400);
			throw new Error(error.message);
		}
	}
});

const fetchChats = asyncHandler(async (req, res) => {
	try {
		let chats = await Chat.find({
			users: { $elemMatch: { $eq: req.user._id } },
		})
			.populate("users", "-password")
			.populate("groupAdmin", "-password")
			.populate("latestMessage")
			.sort({ updatedAt: -1 });

		chats = await User.populate(chats, {
			path: "latestMessage.sender",
			select: "name avatar email",
		});

		// Filter out chats with deleted users
		chats = chats.filter((chat) => chat.users.every((user) => user._id));

		res.status(200).send(chats);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const createGroupChats = asyncHandler(async (req, res) => {
	if (!req.body.users || !req.body.name) {
		return res.status(400).send({
			message: "Please fill all the fields",
		});
	}

	const users = JSON.parse(req.body.users);

	// group should have atleast 2 users
	if (users.length < 2) {
		return res.status(400).send({
			message: "Please select atleast 2 users",
		});
	}

	users.push(req.user);

	try {
		const groupChat = await Chat.create({
			chatName: req.body.name,
			isGroupChat: true,
			users: users,
			groupAdmin: req.user,
		});

		const fullGroupChat = await Chat.findOne({
			_id: groupChat._id,
		})
			.populate("users", "-password")
			.populate("groupAdmin", "-password");

		res.status(200).json(fullGroupChat);
	} catch (error) {
		res.status(400);
		throw new Error(error.message);
	}
});

const renameGroup = asyncHandler(async (req, res) => {
	const { chatId, chatName } = req.body;
	const updatedChat = await Chat.findByIdAndUpdate(
		chatId,
		{ chatName },
		{ new: true },
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!updatedChat) {
		return res.status(400).send({
			message: "Chat not found",
		});
	}
	res.json(updatedChat);
});

const addToGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const added = await Chat.findByIdAndUpdate(
		chatId,
		{ $push: { users: userId } },
		{ new: true },
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!added) {
		res.status(400);
		throw new Error("Chat not found");
	}
	res.json(added);
});

const removeFromGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const removed = await Chat.findByIdAndUpdate(
		chatId,
		{ $pull: { users: userId } },
		{ new: true },
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!removed) {
		res.status(400);
		throw new Error("Chat not found");
	}
	res.json(removed);
});

module.exports = {
	accessChat,
	fetchChats,
	createGroupChats,
	renameGroup,
	addToGroup,
	removeFromGroup,
};
