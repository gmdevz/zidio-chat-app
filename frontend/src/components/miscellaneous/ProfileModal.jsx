import { ViewIcon } from "@chakra-ui/icons";
import {
	Button,
	IconButton,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
} from "@chakra-ui/react";

const ProfileModal = ({ user, children }) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
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

			<Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
				<ModalOverlay />
				<ModalContent height="410px">
					<ModalHeader
						fontSize="40px"
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
							boxSize="150px"
							src={user.avatar}
							alt={user.name}
						/>
						<Text
							fontSize={{ base: "20px", md: "25px" }}
							fontFamily="Work sans"
						>
							Email: {user.email}
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button colorScheme="blue" mr={3} onClick={onClose}>
							Close
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};
export default ProfileModal;
