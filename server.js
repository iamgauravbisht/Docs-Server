const mongoose = require("mongoose");
const express = require("express");
const authController = require("./controller/authController");
const docController = require("./controller/docController");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");
const { Document } = require("./model/User");

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
// app.use(authController.verifyAuth_get());

// Create a server using Express app
const server = app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//----------------------------- routes------------------------------//
// auths
app.post("/signup", authController.signup_post);
app.get("/verifyAuth", authController.verifyAuth_get);
app.get("/me", authController.Me);
app.post("/login", authController.login_post);
app.get("/logout", authController.logout_get);

// docs
app.post("/createDoc", docController.create_post);
app.get("/deleteDoc", docController.delete_get);
app.post("/updateDoc", docController.update_post);
app.get("/editDoc", docController.edit_get);
app.get("/searchDoc", docController.search_get);
app.post("/allDocs", docController.all_post);
app.post("/recentDocs", docController.recent_post);

const io = socket(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

async function findOrCreateDocument(id, userId) {
  if (id == null || userId == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({
    title: "Untitled",
    _id: id,
    owner: userId,
  });
}

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, userId) => {
    const document = await findOrCreateDocument(documentId, userId);
    socket.join(documentId);
    socket.emit("load-document", document.delta);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { delta: data });
    });
  });
});

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
