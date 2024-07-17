import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
	Avatar,
	Box,
	Button,
	Drawer,
	DrawerBody,
	DrawerContent,
	DrawerHeader,
	DrawerOverlay,
	Input,
	Menu,
	MenuButton,
	MenuDivider,
	MenuItem,
	MenuList,
	Spinner,
	Text,
	Tooltip,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";
import { getSender } from "../../config/ChatLogic";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import { debounce } from "lodash";

const SideDrawer = () => {
	const [search, setSearch] = useState("");
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [loadingChat, setLoadingChat] = useState();

	const {
		user,
		setSelectedChat,
		chats,
		setChats,
		notification,
		setNotification,
	} = ChatState();

	const navigate = useNavigate();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const logoutHandler = async () => {
		const userInfo = JSON.parse(localStorage.getItem("userInfo"));
		if (userInfo?.email.startsWith("guest_")) {
			try {
				await axios.delete("/api/user/guestlogout", {
					headers: {
						Authorization: `Bearer ${userInfo.token}`,
					},
				});
				console.log("Guest user logged out successfully");
			} catch (_error) {
				toast({
					title: "Error logging out",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
			}
		}
		localStorage.removeItem("userInfo");
		localStorage.removeItem("notifications");

		navigate("/");
	};
	// const fetchNotifications = async () => {
	// 	if (!user) return;

	// 	try {
	// 		const config = {
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 				Authorization: `Bearer ${user.token}`,
	// 			},
	// 		};

	// 		const { data } = await axios.get("/api/notification", config);
	// 		// console.log("Fetched notifications:", data);
	// 		setNotification(data);
	// 	} catch (error) {
	// 		toast({
	// 			title: "Error Occured!",
	// 			description: "Failed to load notifications",
	// 			status: "error",
	// 			duration: 5000,
	// 			isClosable: true,
	// 			position: "bottom-left",
	// 		});
	// 	}
	// };
	const toast = useToast();

	const handleClose = () => {
		setSearch("");
		setSearchResult([]);
		onClose();
	};
	const handleSearch = debounce(async (value) => {
		if (!value) {
			setSearchResult([]);
			return;
		}
		try {
			setLoading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};
			const { data } = await axios.get(`/api/user?search=${value}`, config);
			if (data.length === 0) {
				setSearchResult([{ _id: "not-found", name: "No user found" }]);
			} else {
				setSearchResult(data);
			}
			setLoading(false);
		} catch (error) {
			toast({
				title: "Error in search",
				description: "Failed to load the search results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			setLoading(false);
		}
	}, 300);
	const fetchOnlineUsers = async () => {
		try {
			setLoading(true);
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};
			const { data } = await axios.get("/api/user/online", config);
			const onlineUsers = data.filter(
				(onlineUser) => onlineUser._id !== user._id,
			);
			setSearchResult(onlineUsers);
			setLoading(false);
		} catch (error) {
			toast({
				title: "Error Occurred!",
				description: "Failed to load online users",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
			setLoading(false);
		}
	};

	const accessChat = async (userId) => {
		try {
			setLoadingChat(true);
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.post("/api/chat", { userId }, config);

			if (!chats.find((chat) => chat._id === data._id)) {
				setChats([...chats, data]);
			}

			setSelectedChat(data);
			setLoadingChat(false);
			handleClose();
		} catch (error) {
			toast({
				title: "Error fetching the chat",
				description: error.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	const handleNotificationClick = async (notif) => {
		try {
			await axios.put(
				`/api/notification/${notif._id}`,
				{},
				{
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				},
			);
			setSelectedChat(notif.chat);
			setNotification((prevNotifications) =>
				prevNotifications.filter((n) => n._id !== notif._id),
			);
		} catch (_error) {
			toast({
				title: "Error Occured!",
				description: "Failed to mark notification as read",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	return (
		<>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				background="white"
				w="100%"
				p="5px 10px 5px 10px"
				borderWidth="5px"
			>
				<Tooltip label="Search users to chat" hasArrow placement="bottom-end">
					<Button variant="ghost" onClick={onOpen}>
						<i className="fa-solid fa-magnifying-glass" />
						<Text display={{ base: "none", md: "flex" }} px="4">
							Search Users
						</Text>
					</Button>
				</Tooltip>

				<Text fontSize="2xl" fontFamily="Work Sans">
					Zidio Chatty
				</Text>
				<div>
					<Menu>
						<MenuButton p={1}>
							{/* <NotificationBadge
								count={notification.length}
								effect={Effect.SCALE}
							/>
							<BellIcon fontSize="2xl" m={1} /> */}
							<Box position="relative" display="inline-block">
								<BellIcon fontSize="2xl" m={1} />
								{notification.length > 0 ? (
									<Box
										position="absolute"
										top="0px"
										right="5px"
										width="8px"
										height="8px"
										backgroundColor="red"
										borderRadius="50%"
										animation="pulse 1s infinite"
										sx={{
											"@keyframes pulse": {
												"0%": {
													transform: "scale(0.95)",
													boxShadow: "0 0 0 0 rgba(255, 0, 0, 0.7)",
												},
												"70%": {
													transform: "scale(1)",
													boxShadow: "0 0 0 10px rgba(255, 0, 0, 0)",
												},
												"100%": {
													transform: "scale(0.95)",
													boxShadow: "0 0 0 0 rgba(255, 0, 0, 0)",
												},
											},
										}}
									/>
								) : (
									""
								)}
							</Box>
						</MenuButton>
						<MenuList pl={2}>
							{!notification.length && "No New Messages"}
							{notification.map((notif) => (
								<MenuItem
									key={notif._id}
									onClick={() => {
										setSelectedChat(notif.chat);
										setNotification(notification.filter((n) => n !== notif));
										handleNotificationClick(notif);
									}}
								>
									{notif.chat.isGroupChat
										? `New Message in ${notif.chat.chatName}`
										: `New Message from ${notif.sender.name}`}
								</MenuItem>
							))}
						</MenuList>
					</Menu>
					<Menu>
						<MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
							<Avatar
								size="sm"
								cursor="pointer"
								name={user.name}
								src={user.avatar}
							/>
						</MenuButton>
						<MenuList>
							<ProfileModal user={user}>
								<MenuItem>My Profile</MenuItem>
							</ProfileModal>
							<MenuDivider />
							<MenuItem onClick={logoutHandler}>Logout</MenuItem>
						</MenuList>
					</Menu>
				</div>
			</Box>
			<Drawer placement="left" onClose={handleClose} isOpen={isOpen}>
				<DrawerOverlay />
				<DrawerContent>
					<DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
					<DrawerBody>
						<Box display="flex" pb={2}>
							<Input
								placeholder="Search by name or email"
								mr={2}
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									handleSearch(e.target.value);
								}}
							/>
							<Button onClick={fetchOnlineUsers} ml={2}>
								<i className="fa-solid fa-users" />
							</Button>
						</Box>
						{loading ? (
							<ChatLoading />
						) : (
							searchResult?.map((user) =>
								user._id === "not-found" ? (
									<Text key="not-found" p={2}>
										{user.name}
									</Text>
								) : (
									<UserListItem
										key={user._id}
										user={user}
										handleFunction={() => accessChat(user._id)}
									/>
								),
							)
						)}
						{loadingChat && <Spinner ml="auto" display="flex" />}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default SideDrawer;
