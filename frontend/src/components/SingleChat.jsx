import { ArrowBackIcon } from "@chakra-ui/icons";
import {
	Box,
	FormControl,
	IconButton,
	Input,
	Spinner,
	Text,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogic";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import "./styles.css";
import Lottie from "lottie-react";
import io from "socket.io-client";
import animationData from "../animations/typinghand.json";
import ScrollableChat from "./ScrollableChat";

const ENDPOINT = "http://localhost:5000";

let socket;
let selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [socketConnected, setSocketConnected] = useState(false);
	const [typing, setTyping] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const toast = useToast();
	const { user, selectedChat, setSelectedChat, notification, setNotification } =
		ChatState();
	ChatState();

	const markNotificationAsRead = async () => {
		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};
			await axios.put(
				`/api/notification/markAsRead/${selectedChat._id}`,
				{},
				config,
			);
			// Clear notifications from the selected user
			setNotification((prevNotifications) =>
				prevNotifications.filter((n) => n.chat._id !== selectedChat._id),
			);

			// Update localStorage
			localStorage.setItem(
				"notifications",
				JSON.stringify(
					notification.filter((n) => n.chat._id !== selectedChat._id),
				),
			);
			// fetchNotifications();
		} catch (error) {
			console.error("Error marking notifications as read:", error);
		}
	};

	const fetchMessages = async () => {
		if (!selectedChat) return;

		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};
			setLoading(true);
			const { data } = await axios.get(
				`/api/message/${selectedChat._id}`,
				config,
			);

			console.log(data);
			setMessages(data);
			setLoading(false);
			socket.emit("join chat", selectedChat._id);
		} catch (_error) {
			toast({
				title: "Error Occured!",
				description: "Failed to Load the Messages",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	const sendMessage = async (event) => {
		if (event.key === "Enter" && newMessage) {
			socket.emit("stop typing", selectedChat._id);
			event.preventDefault();

			try {
				const config = {
					headers: {
						"Content-type": "application/json",
						Authorization: `Bearer ${user.token}`,
					},
				};
				setNewMessage("");

				const { data } = await axios.post(
					"/api/message",
					{
						content: newMessage,
						chatId: selectedChat,
					},
					config,
				);

				console.log(messages);

				socket.emit("new message", data);
				setMessages([...messages, data]);
			} catch (_error) {
				toast({
					title: "Error Occured!",
					description: "Failed to Load the Messages",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
		}
	};

	const typingHandler = (e) => {
		setNewMessage(e.target.value);

		// Typing Indicator Logic
		if (!socketConnected) return;
		if (!typing) {
			setTyping(true);
			socket.emit("typing", selectedChat._id);
		}
		const lastTypingTime = new Date().getTime();
		const timerLength = 3000;
		setTimeout(() => {
			const timeNow = new Date().getTime();
			const timeDiff = timeNow - lastTypingTime;

			if (timeDiff >= timerLength && typing) {
				socket.emit("stop typing", selectedChat._id);
				setTyping(false);
			}
		}, timerLength);
	};

	useEffect(() => {
		if (selectedChat) {
			markNotificationAsRead();
		}
	}, [selectedChat]);

	useEffect(() => {
		socket = io(ENDPOINT);
		socket.emit("setup", user);
		socket.on("connected", () => setSocketConnected(true));
		socket.on("typing", () => setIsTyping(true));
		socket.on("stop typing", () => setIsTyping(false));
	}, []);

	useEffect(() => {
		socket.on("new notification", (newNotification) => {
			setNotification((prev) => [newNotification, ...prev]);
		});

		return () => {
			socket.off("new notification");
		};
	}, []);

	useEffect(() => {
		fetchMessages();

		selectedChatCompare = selectedChat;
	}, [selectedChat]);

	useEffect(() => {
		socket.on("message received", (newMessageReceived) => {
			if (
				!selectedChatCompare ||
				selectedChatCompare._id !== newMessageReceived.chat._id
			) {
				setNotification((prevNotifications) => {
					const newNotification = newMessageReceived;
					const isDuplicate = prevNotifications.some(
						(n) => n._id === newNotification._id,
					);
					if (!isDuplicate) {
						const updatedNotifications = [
							newNotification,
							...prevNotifications,
						];
						localStorage.setItem(
							"notifications",
							JSON.stringify(updatedNotifications),
						);
						return updatedNotifications;
					}
					return prevNotifications;
				});
			} else {
				setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
			}
		});
		return () => {
			socket.off("message received");
		};
	});

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: "28px", md: "30px" }}
						pb={3}
						px={2}
						width="100%"
						fontFamily="Work sans"
						display="flex"
						justifyContent={{ base: "space-between" }}
						alignItems="center"
					>
						<IconButton
							display={{ base: "flex", md: "none" }}
							icon={<ArrowBackIcon />}
							onClick={() => setSelectedChat("")}
						/>
						{messages &&
							(!selectedChat.isGroupChat ? (
								<>
									{/* {console.log(
										"Rendering sender name",
										user,
										selectedChat.users,
									)} */}
									{getSender(user, selectedChat.users)}
									<ProfileModal
										user={getSenderFull(user, selectedChat.users)}
									/>
								</>
							) : (
								<>
									{selectedChat.chatName.toUpperCase()}
									<UpdateGroupChatModal
										fetchAgain={fetchAgain}
										setFetchAgain={setFetchAgain}
										fetchMessages={fetchMessages}
									/>
								</>
							))}
					</Text>
					<Box
						display="flex"
						flexDir="column"
						justifyContent="flex-end"
						p={3}
						bg="#E8E8E8"
						w="100%"
						h="100%"
						borderRadius="lg"
						overflowY="hidden"
					>
						{loading ? (
							<Spinner
								size="xl"
								w={20}
								h={20}
								alignSelf="center"
								margin="auto"
							/>
						) : (
							<div className="messages">
								<ScrollableChat messages={messages} />
							</div>
						)}

						<FormControl onKeyDown={sendMessage} isRequired mt={3}>
							{isTyping ? (
								<div
									style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										height: "40px",
										width: "100%",
										maxWidth: "300px",
										margin: "0 auto",
									}}
								>
									<Lottie
										animationData={animationData}
										style={{ width: 100 }}
										// style={{ marginBottom: 15, marginLeft: 0 }}
									/>
								</div>
							) : null}
							<Input
								variant="filled"
								bg="#E0E0E0"
								placeholder="Enter a message.."
								onChange={typingHandler}
								value={newMessage}
							/>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					height="100%"
				>
					<Text fontSize="3xl" pb={3} fontFamily="Work sans">
						Click on a user to start chatting
					</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
