export const getSender = (loggedUser, users) => {
	if (users.length > 0 && loggedUser && users[0]._id && loggedUser._id) {
		return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
	} else {
		// Handle the case where users or loggedUser is undefined or empty
		return "Unknown User";
	}
};
