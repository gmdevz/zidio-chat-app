const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();
const app = express();

// to accept json data
app.use(express.json());

app.get("/", (req, res) => {
	res.send("API is Running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(`Server started on PORT ${PORT}`.yellow.bold),
);

const io = require("socket.io")(server, {
	pingTimeout: 60000,
	cors: {
		origin: "http://localhost:5173", // for development
	},
});

io.on("connection", (socket) => {
	console.log("Connected to socket.io");
	socket.on("setup", (userData) => {
		socket.join(userData._id);
		console.log(userData._id);
		socket.emit("connected");
	});
	socket.on("join chat", (room) => {
		socket.join(room);
		console.log(`User Joined Room: ${room}`);
	});

	socket.on("typing", (room) => {
		socket.in(room).emit("typing");
	});

	socket.on("stop typing", (room) => {
		socket.in(room).emit("stop typing");
	});

	socket.on("new message", (newMessageReceived) => {
		const chat = newMessageReceived.chat;

		if (!chat.users) return console.log("chat.users not defined");

		const userId = newMessageReceived.sender._id;

		chat.users.forEach((user) => {
			if (user._id == userId) return;
			socket.to(user._id).emit("message received", newMessageReceived);
		});
	});

	socket.on("new notification", (chatId) => {
		socket.in(chatId).emit("notification received", chatId);
	});

	socket.off("setup", () => {
		console.log("USER DISCONNECTED");
		socket.leave(userData._id);
	});
});
