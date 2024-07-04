const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
	{
		// Chat Name
		chatName: { type: String, trim: true },
		// isGroupChat
		isGroupChat: { type: Boolean, default: false },
		// users
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		// latestMessage
		latestMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Message",
		},
		// groupAdmin if its a group chat it will check who is the admin
		groupAdmin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
