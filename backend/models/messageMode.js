const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
	{
		// sender
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		// content
		content: { type: String, trim: true },
		// chat
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
		},
	},
	{
		timestamps: true,
	},
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;
