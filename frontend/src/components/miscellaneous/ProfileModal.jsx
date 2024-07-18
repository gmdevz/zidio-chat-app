import { ViewIcon } from "@chakra-ui/icons";
import {
	Button,
	IconButton,
	Image,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../../Context/ChatProvider";

const ProfileModal = ({ user, children }) => {
	const { user: currentUser } = ChatState();
	const { isOpen, onOpen, onClose } = useDisclosure();
	const toast = useToast();
	const [newName, setNewName] = useState(user.name);
	const [isEditing, setIsEditing] = useState(false);

	const { setUser } = ChatState();

	const handleRename = async () => {
		try {
			const userInfo = JSON.parse(localStorage.getItem("userInfo"));
			const config = {
				headers: {
					Authorization: `Bearer ${userInfo.token}`,
				},
			};
			// Check if the name is already taken
			const checkResponse = await axios.get(
				`/api/user/checkname/${newName}`,
				config,
			);
			if (checkResponse.data.exists) {
				toast({
					title: "Name already taken",
					description: "Please choose a different name",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "bottom",
				});
				return;
			}

			const { data } = await axios.put("/api/user/rename", { newName }, config);
			setUser(data);
			localStorage.setItem("userInfo", JSON.stringify(data));
			toast({
				title: "Name updated successfully",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setIsEditing(false);
		} catch (error) {
			toast({
				title: "Error updating name",
				description: error.response?.data?.message || "An error occurred",
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
		}
	};

	return (
		<>
			{children ? (
				<span onClick={onOpen}>{children}</span>
			) : (
				<IconButton
					display={{ base: "flex" }}
					icon={<ViewIcon />}
					onClick={onOpen}
				/>
			)}

			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size={{ base: "sm", md: "md", lg: "lg" }}
			>
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize={{ base: "20px", md: "24px" }}
						fontFamily="Work sans"
						display="flex"
						justifyContent="center"
					>
						{user.name}
					</ModalHeader>
					<ModalCloseButton />
					<ModalBody
						display="flex"
						flexDir="column"
						alignItems="center"
						justifyContent="space-between"
					>
						<Image
							borderRadius="full"
							boxSize={{ base: "100px", md: "150px" }}
							src={user.avatar}
							alt={user.name}
						/>
						{user._id === currentUser._id ? (
							isEditing ? (
								<Input
									value={newName}
									onChange={(e) => setNewName(e.target.value)}
									placeholder="Enter new name"
									mt={4}
									size={{ base: "sm", md: "md" }}
								/>
							) : (
								<Text
									fontSize={{ base: "18px", md: "22px" }}
									fontFamily="Work sans"
									mt={4}
								>
									{user.name}
								</Text>
							)
						) : (
							<Text
								fontSize={{ base: "18px", md: "22px" }}
								fontFamily="Work sans"
								mt={4}
							>
								{user.name}
							</Text>
						)}
						<Text
							fontSize={{ base: "16px", md: "20px" }}
							fontFamily="Work sans"
							mt={4}
						>
							Email: {user.email}
						</Text>
					</ModalBody>
					<ModalFooter>
						{user._id === currentUser._id &&
							(isEditing ? (
								<>
									<Button
										colorScheme="blue"
										mr={3}
										onClick={handleRename}
										size={{ base: "sm", md: "md" }}
									>
										Save
									</Button>
									<Button
										variant="ghost"
										onClick={() => setIsEditing(false)}
										size={{ base: "sm", md: "md" }}
									>
										Cancel
									</Button>
								</>
							) : (
								<Button
									colorScheme="blue"
									mr={3}
									onClick={() => setIsEditing(true)}
									size={{ base: "sm", md: "md" }}
								>
									Edit Name
								</Button>
							))}
						<Button
							colorScheme="blue"
							mr={3}
							onClick={onClose}
							size={{ base: "sm", md: "md" }}
						>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
export default ProfileModal;
