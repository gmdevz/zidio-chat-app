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
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogic";

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

	const logoutHandler = () => {
		localStorage.removeItem("userInfo");
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
	const handleSearch = async (e) => {
		e.preventDefault();
		if (!search) {
			toast({
				title: "Please enter something in search",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top-left",
			});
			return;
		}

		try {
			setLoading(true);

			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.get(`/api/user?search=${search}`, config);

			setLoading(false);
			setSearchResult(data);

			// when user is not found
			if (data.length === 0) {
				toast({
					title: "No User Found",
					description: "User with this name does not exist",
					status: "info",
					duration: 5000,
					isClosable: true,
					position: "top-left",
				});
			}
		} catch (_error) {
			toast({
				title: "Error in search",
				description: "Failed to load the search results",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
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
		} catch (error) {
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
							/> */}
							<Box position="relative" display="inline-block">
								<BellIcon fontSize="2xl" m={1} />
								{notification.length > 0 && (
									<Box
										position="absolute"
										top="0px"
										right="5px"
										width="8px"
										height="8px"
										backgroundColor="red"
										borderRadius="50%"
									/>
								)}
							</Box>{" "}
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
								onChange={(e) => setSearch(e.target.value)}
							/>
							<Button onClick={handleSearch}>Go</Button>
						</Box>
						{loading ? (
							<ChatLoading />
						) : (
							searchResult?.map((user) => (
								<UserListItem
									key={user._id}
									user={user}
									handleFunction={() => accessChat(user._id)}
								/>
							))
						)}
						{loadingChat && <Spinner ml="auto" display="flex" />}
					</DrawerBody>
				</DrawerContent>
			</Drawer>
		</>
	);
};

export default SideDrawer;
