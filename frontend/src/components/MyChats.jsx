import { AddIcon } from "@chakra-ui/icons";
import { Box, Button, Stack, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Context/ChatProvider";
import { getSender } from "../config/ChatLogic";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { socket } from "../config/socketConfig";

const MyChats = ({ fetchAgain }) => {
	const [loggedUser, setLoggedUser] = useState();
	const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

	const toast = useToast();
	const _navigate = useNavigate();

	const fetchChats = async () => {
		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.get("/api/chat", config);
			const validChats = data.filter((chat) =>
				chat.users.every((user) => user._id),
			);
			setChats(validChats);
		} catch (_error) {
			toast({
				title: "Error Occured!",
				description: "Failed to load the chats",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom-left",
			});
		}
	};

	// const handleChatSelection = (chat) => {
	// 	if (chat.users.every((user) => user._id)) {
	// 		setSelectedChat(chat);
	// 	} else {
	// 		// Handle invalid chat (e.g., show a message or remove it)
	// 		toast({
	// 			title: "Chat no longer available",
	// 			status: "warning",
	// 			duration: 5000,
	// 			isClosable: true,
	// 		});
	// 		// Optionally remove the invalid chat from the list
	// 		setChats((prevChats) => prevChats.filter((c) => c._id !== chat._id));
	// 	}
	// };
	// useEffect(() => {
	// 	const userInfo = JSON.parse(localStorage.getItem("userInfo"));
	// 	if (userInfo) {
	// 		setUser(userInfo);
	// 		fetchChats();
	// 	} else {
	// 		navigate("/");
	// 	}
	// }, [navigate]);

	useEffect(() => {
		setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
		fetchChats();
		socket.on("guestUserDeleted", (deletedUserId) => {
			setChats((prevChats) =>
				prevChats.filter(
					(chat) => !chat.users.some((user) => user._id === deletedUserId),
				),
			);
		});

		return () => {
			socket.off("guestUserDeleted");
		};
	}, [fetchAgain]);

	return (
		<>
			<Box
				display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
				flexDir="column"
				alignItems="center"
				p={3}
				bg="white"
				w={{ base: "100%", md: "30%" }}
				borderRadius="lg"
				borderWidth="1px"
			>
				<Box
					pb={3}
					px={3}
					fontSize={{ base: "28px", md: "30px" }}
					fontFamily="Work sans"
					display="flex"
					w="100%"
					justifyContent="space-between"
					alignItems="center"
				>
					My Chats
					<GroupChatModal>
						<Button
							display="flex"
							fontSize={{ base: "17px", md: "10px", lg: "15px" }}
							width="100%"
							justifyContent={{
								base: "center",
								md: "flex-start",
								lg: "flex-start",
							}}
						>
							<Box display={{ base: "none", lg: "inline" }}>New Group Chat</Box>
							<Box
								display={{ base: "block", md: "block", lg: "block" }}
								ml={{ lg: 2 }}
							>
								<AddIcon />
							</Box>
						</Button>
					</GroupChatModal>
				</Box>

				<Box
					display="flex"
					flexDir="column"
					p={3}
					bg="#F8F8F8"
					w="100%"
					h="100%"
					borderRadius="lg"
					overflow="hidden"
				>
					{chats ? (
						<Stack overflowY="scroll">
							{chats?.map((chat) => (
								<Box
									key={chat._id}
									onClick={() => setSelectedChat(chat)}
									cursor="pointer"
									bg={selectedChat === chat ? "#38B2Ac" : "#E8E8E8"}
									color={selectedChat === chat ? "white" : "black"}
									p={3}
									borderRadius="lg"
								>
									<Text>
										{!chat.isGroupChat
											? getSender(loggedUser, chat.users)
											: chat.chatName}
									</Text>
								</Box>
							))}
						</Stack>
					) : (
						<ChatLoading />
					)}
				</Box>
			</Box>
		</>
	);
};

export default MyChats;
