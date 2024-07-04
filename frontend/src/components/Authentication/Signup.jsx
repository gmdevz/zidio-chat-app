import {
	Button,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	VStack,
	useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
	const [show, setShow] = useState(false);
	const [name, setName] = useState();
	const [email, setEmail] = useState();
	const [password, setPassword] = useState();
	const [confirmPassword, setConfirmPassword] = useState();
	const [avatar, setAvatar] = useState();
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const toast = useToast();

	const handleClick = () => setShow(!show);

	const postDetails = (avatars) => {
		setLoading(true);
		if (avatars === undefined) {
			toast({
				title: "Please Select an Image",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		if (avatars.type === "image/jpeg" || avatars.type === "image/png") {
			const data = new FormData();
			data.append("file", avatars);
			data.append("upload_preset", "zidio-chat-app");
			data.append("cloud_name", "gmdevz");
			fetch("https://api.cloudinary.com/v1_1/gmdevz/image/upload", {
				method: "POST",
				body: data,
			})
				.then((res) => res.json())
				.then((data) => {
					setAvatar(data.url.toString());
					console.log(data.url.toString());
					setLoading(false);
				})
				.catch((_err) => {
					setLoading(false);
					toast({
						title: "Signup Failed",
						status: "error",
						duration: 5000,
						isClosable: true,
						position: "bottom",
					});
				});
		} else {
			setLoading(false);
			toast({
				title: "Please Select an Image",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}
	};

	const submitHandler = async () => {
		setLoading(true);
		// check if all fields are filled
		if (!name || !email || !password || !confirmPassword) {
			toast({
				title: "Please Fill all the Feilds",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
			return;
		}

		if (password !== confirmPassword) {
			toast({
				title: "Passwords Don't Match",
				status: "warning",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			return;
		}

		try {
			const config = {
				headers: {
					"Content-Type": "application/json",
				},
			};

			const { data } = await axios.post(
				"/api/user",
				{ name, email, password, avatar },
				config,
			);

			toast({
				title: "Signup Successful",
				status: "success",
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});

			localStorage.setItem("userInfo", JSON.stringify(data));

			setLoading(false);

			navigate("/chats");
		} catch (error) {
			toast({
				title: "Error Occured",
				status: "error",
				description: error.response.data.message,
				duration: 5000,
				isClosable: true,
				position: "bottom",
			});
			setLoading(false);
		}
	};

	return (
		<VStack spacing="5px">
			// FormControl for name
			<FormControl id="first-name" isRequired>
				<FormLabel>Name</FormLabel>
				<Input
					placeholder="Enter Your Name"
					onChange={(event) => {
						setName(event.target.value);
					}}
				/>
			</FormControl>
			// FormControl for email
			<FormControl id="email" isRequired>
				<FormLabel>Email</FormLabel>
				<Input
					placeholder="Enter Your Email"
					onChange={(event) => {
						setEmail(event.target.value);
					}}
				/>
			</FormControl>
			// FormControl for password
			<FormControl id="password" isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Enter Your Password"
						onChange={(event) => {
							setPassword(event.target.value);
						}}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			// FormControl for confirm password
			<FormControl id="password" isRequired>
				<FormLabel>Confirm Password</FormLabel>
				<InputGroup>
					<Input
						type={show ? "text" : "password"}
						placeholder="Confirm Password"
						onChange={(event) => {
							setConfirmPassword(event.target.value);
						}}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
							{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			// FormControl for profile pic
			<FormControl id="avatar">
				<FormLabel>Upload your Picture</FormLabel>
				<Input
					type="file"
					p={1.5}
					accept="image/*"
					onChange={(event) => postDetails(event.target.files[0])}
				/>
			</FormControl>
			<Button
				colorScheme="blue"
				width="100%"
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Sign Up
			</Button>
		</VStack>
	);
};

export default Signup;
