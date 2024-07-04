const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const connecection = await mongoose.connect(process.env.MONGO_URI);

		console.log(
			`MongoDB connected: ${connecection.connection.host}`.cyan.underline,
		);
	} catch (error) {
		console.log(`Error: ${error.message}`.red.bold);
		process.exit(1);
	}
};

module.exports = connectDB;
