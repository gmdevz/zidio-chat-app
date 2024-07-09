import { Avatar, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import {
	isLastMessage,
	isSameSender,
	isSameSenderMargin,
	isSameUser,
} from "../config/ChatLogic";

const ScrollableChat = ({ messages }) => {
	const { user } = ChatState();
	return (
		<ScrollableFeed>
			{messages?.map((currentMessage, i) => (
				<div style={{ display: "flex" }} key={currentMessage._id}>
					{(isSameSender(messages, currentMessage, i, user._id) ||
						isLastMessage(messages, i, user._id)) && (
						<Tooltip
							label={currentMessage.sender.name}
							placement="bottom-start"
							hasArrow
						>
							<Avatar
								mt="7px"
								mr={1}
								size="sm"
								cursor="pointer"
								name={currentMessage.sender.name}
								src={currentMessage.sender.avatar}
							/>
						</Tooltip>
					)}
					<span
						style={{
							backgroundColor: `${
								currentMessage.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
							}`,
							borderRadius: "20px",
							padding: "5px 15px",
							maxWidth: "75%",
							marginLeft: isSameSenderMargin(
								messages,
								currentMessage,
								i,
								user._id,
							),
							marginTop: isSameUser(messages, currentMessage, i) ? 3 : 10,
						}}
					>
						{currentMessage.content}
					</span>
				</div>
			))}
		</ScrollableFeed>
	);
};

export default ScrollableChat;
