const mongoose = require("mongoose");
const express = require("express");
const authController = require("./controller/authController");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const socket = require("socket.io");

const app = express();

const corsOptions = {
	origin: "http://localhost:5173",
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Create a server using Express app
const server = app.listen(3000, () => {
	console.log("Server is running on port 3000");
});

// routes
app.post("/signup", authController.signup_post);

// const io = socket(server, {
//   cors: {
//     origin: "http://127.0.0.1:5173",
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("connected to socket");

//   socket.on("send-changes", (delta) => {
//     socket.broadcast.emit("receive-changes", delta);
//     console.log("changes received");
//   });
// });

// mongoose
const dbURI =
	"mongodb+srv://docs:EzBsS4rtkZ6lPUHy@cluster0.ei5qidr.mongodb.net/docDatabase";

mongoose
	.connect(dbURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// useCreateIndex: true,
	})
	.then((result) => {
		console.log("connected to db");
	})
	.catch((err) => {
		console.log(err);
	});
