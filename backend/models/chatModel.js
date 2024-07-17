const mongoose = require("mongoose");
const Message = require("./messageModel");

const chatModel = mongoose.Schema(
	{
		chatName: { type: String, trim: true },
		isGroupChat: { type: Boolean, default: false },
		users: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		latestMessage: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Message",
		},
		groupAdmin: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

chatModel.pre("remove", async function (next) {
	await Message.deleteMany({ chat: this._id });
	next();
});

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
