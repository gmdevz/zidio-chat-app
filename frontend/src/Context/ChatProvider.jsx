import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../config/socketConfig";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
	const [user, setUser] = useState();
	const [selectedChat, setSelectedChat] = useState();
	const [chats, setChats] = useState([]);
	const [notification, setNotification] = useState([]);

	const navigate = useNavigate();
	const toast = useToast();

	const fetchNotifications = async () => {
		if (!user) return;

		const userInfo = JSON.parse(localStorage.getItem("userInfo"));
		if (userInfo && !userInfo.email.startsWith("guest_")) {
			try {
				const config = {
					headers: {
						Authorization: `Bearer ${userInfo.token}`,
					},
				};
				const { data } = await axios.get("/api/notification", config);
				setNotification(data);
			} catch (_error) {
				toast({
					title: "Error Occured!",
					description: "Failed to load notifications",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom-left",
				});
			}
		}
	};

	useEffect(() => {
		if (notification.length > 0) {
			localStorage.setItem("notifications", JSON.stringify(notification));
		}
	}, [notification]);

	// useEffect(() => {
	// 	const userInfo = JSON.parse(localStorage.getItem("userInfo"));
	// 	setUser(userInfo);

	// 	if (userInfo) {
	// 		const storedNotifications = JSON.parse(
	// 			localStorage.getItem("notifications") || "[]",
	// 		);
	// 		setNotification(storedNotifications);
	// 		fetchNotifications();
	// 	}
	// }, []);

	useEffect(() => {
		const userInfo = JSON.parse(localStorage.getItem("userInfo"));
		setUser(userInfo);

		// redirect to login if user is not logged in
		if (!userInfo) {
			navigate("/");
		}

		// fetch notifications from local storage
		const storedNotifications = JSON.parse(
			localStorage.getItem("notifications") || "[]",
		);
		setNotification(storedNotifications);
		fetchNotifications();
	}, [navigate]);
	socket.on("guestUserDeleted", ({ userId, chatIds, notificationsDeleted }) => {
		setChats((prevChats) =>
			prevChats.filter(
				(chat) =>
					!chatIds.includes(chat._id) &&
					!chat.users.some((user) => user._id === userId),
			),
		);
		if (notificationsDeleted) {
			setNotification((prevNotifications) =>
				prevNotifications.filter(
					(n) => n.sender._id !== userId && n.recipient._id !== userId,
				),
			);
		}
		setSelectedChat(null);
	});

	return (
		<ChatContext.Provider
			value={{
				user,
				setUser,
				selectedChat,
				setSelectedChat,
				chats,
				setChats,
				notification,
				setNotification,
				fetchNotifications,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export const ChatState = () => {
	return useContext(ChatContext);
};

export default ChatProvider;
