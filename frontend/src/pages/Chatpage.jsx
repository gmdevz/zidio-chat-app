import { Box } from "@chakra-ui/react";
import { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import ChatBox from "../components/ChatBox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";

const Chatpage = () => {
	const { user } = ChatState();
	const [fetchAgain, setfetchAgain] = useState(false);

	return (
		<div style={{ width: "100%" }}>
			{user && <SideDrawer />}
			<Box
				display="flex"
				justifyContent="space-between"
				width="100%"
				height="92vh"
				p="10px"
			>
				{user && <MyChats fetchAgain={fetchAgain} />}
				{user && (
					<ChatBox fetchAgain={fetchAgain} setFetchAgain={setfetchAgain} />
				)}
			</Box>
		</div>
	);
};

export default Chatpage;
