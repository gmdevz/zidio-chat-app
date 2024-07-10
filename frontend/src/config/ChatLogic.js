export const getSender = (loggedUser, users) => {
	return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser, users) => {
	return users[0]._id === loggedUser._id ? users[1] : users[0];
};

// Checks if the current message is of the same sender as the previous message
export const isSameSender = (messages, currentMessage, i, userId) => {
	return (
		i < messages.length - 1 &&
		(messages[i + 1].sender._id !== currentMessage.sender._id ||
			messages[i + 1].sender._id === undefined) &&
		messages[i].sender._id !== userId
	);
};

// Checks if the current message is of the same sender as the next message
export const isLastMessage = (messages, i, userId) => {
	return (
		i === messages.length - 1 &&
		messages[messages.length - 1].sender._id !== userId &&
		messages[messages.length - 1].sender._id
	);
};

// check if the message is of the same sender as the next message
export const isSameSenderMargin = (messages, currentMessage, i, userId) => {
	if (
		i < messages.length - 1 &&
		messages[i + 1].sender._id === currentMessage.sender._id &&
		messages[i].sender._id !== userId
	)
		return 33;
	if (
		(i < messages.length - 1 &&
			messages[i + 1].sender._id !== currentMessage.sender._id &&
			messages[i].sender._id !== userId) ||
		(i === messages.length - 1 && messages[i].sender._id !== userId)
	)
		return 0;
	return "auto";
};

// check if the message is of the same sender as the next message
export const isSameUser = (messages, currentMessage, i) => {
	return i > 0 && messages[i - 1].sender._id === currentMessage.sender._id;
};
