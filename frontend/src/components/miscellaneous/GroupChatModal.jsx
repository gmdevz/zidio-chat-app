import {
	Box,
	Button,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Spinner,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [groupChatName, setGroupChatName] = useState("");
	const [selectedUsers, setSelectedUsers] = useState([]);
	let [search, _setSearch] = useState();
	const [searchResults, setSearchResults] = useState([]);
	const [loading, setLoading] = useState(false);

	const toast = useToast();

	const { user, chats, setChats } = ChatState();

	const handleClose = () => {
		setSearchResults([]);
		setSelectedUsers([]);
		setGroupChatName("");
		onClose();
	};

	const handleSearch = async (query) => {
		_setSearch = query;

		if (!query) {
			// clear the search results
			setSearchResults([]);
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

			const { data } = await axios.get(`/api/user?search=${query}`, config);

			if (data.length === 0) {
				toast({
					title: "No User Found",
					description: "User with this name does not exist",
					status: "info",
					duration: 5000,
					isClosable: true,
				});
			}
			console.log(data);
			const filteredResults = data.filter((result) =>
				[result.name, result.email].some((field) =>
					field.toLowerCase().includes(query.toLowerCase()),
				),
			);
			setLoading(false);
			setSearchResults(filteredResults);
		} catch (_error) {
			toast({
				title: "Error Occured!",
				description: "Failed to search users",
				status: "error",
				duration: 5000,
				isClosable: true,
			});
		}
	};

	const handleGroup = (userToAdd) => {
		if (selectedUsers.includes(userToAdd)) {
			toast({
				title: "User already in group",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
			return;
		}
		setSelectedUsers([userToAdd, ...selectedUsers]);
	};

	const handleSubmit = async () => {
		if (!groupChatName || !selectedUsers) {
			toast({
				title: "Error Occured!",
				description: "Please fill all the fields",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top",
			});

			return;
		}

		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`,
				},
			};

			const { data } = await axios.post(
				"/api/chat/group",
				{
					name: groupChatName,
					users: JSON.stringify(selectedUsers.map((user) => user._id)),
				},
				config,
			);

			setChats([data, ...chats]);
			handleClose();

			toast({
				title: "New Group Chat Created",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
		} catch (error) {
			toast({
				title: "Failed to create group chat",
				description: error.response.data.message,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top",
			});
		}
	};

	const handleDelete = (deleteUser) => {
		setSelectedUsers(
			selectedUsers.filter((user) => user._id !== deleteUser._id),
		);
	};

	return (
		<>
			<span onClick={onOpen}>{children}</span>
			<Modal isOpen={isOpen} onClose={handleClose}>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize="35px"
						fontFamily="Work sans"
						display="flex"
						justifyContent="center"
					>
						Create Group Chat
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody display="flex" flexDir="column" alignItems="center">
						<FormControl>
							<Input
								type="text"
								placeholder="Group Name"
								mb={3}
								onChange={(e) => setGroupChatName(e.target.value)}
							/>
						</FormControl>

						<FormControl>
							<Input
								type="text"
								placeholder="Add Users"
								mb={1}
								onChange={(e) => handleSearch(e.target.value)}
							/>
						</FormControl>
						{/* selected users */}
						<Box width="100%" display="flex" flexWrap="wrap">
							{selectedUsers.map((user) => (
								<UserBadgeItem
									key={user._id}
									user={user}
									handleFunction={() => handleDelete(user)}
								/>
							))}
						</Box>
						{/* render search results here */}
						{loading ? (
							<Spinner size="xl" />
						) : (
							searchResults
								?.slice(0, 4)
								.map((user) => (
									<UserListItem
										key={user._id}
										user={user}
										handleFunction={() => handleGroup(user)}
									/>
								))
						)}
					</ModalBody>

					<ModalFooter>
						<Button colorScheme="blue" onClick={handleSubmit}>
							Create Group
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default GroupChatModal;
