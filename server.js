const mongoose = require("mongoose");
const express = require("express");
const authController = require("./controller/authController");
const docController = require("./controller/docController");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socket = require("socket.io");
const { Document, User } = require("./model/User");
const {
  allDocsUpdateHandler,
  recentDocsUpdateHandler,
} = require("./middleware/middleware");

const app = express();

const allowedOrigins = [
  "https://iamgauravbisht.github.io/gauravdocs/",
  "https://iamgauravbisht.github.io",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
};

// Middleware

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader(
    "Set-Cookie",
    "__Secure-FIRSTPARTY=docserver-ecsy.onrender.com  onrender.com; Secure; HttpOnly; SameSite=None"
  );
  next();
});
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
app.get("/searchDoc", docController.search_get);
app.get("/allDocs", docController.all_get);
app.get("/recentDocs", docController.recent_get);
app.post("/saveName", docController.saveName_post);
app.post("/deleteDoc", docController.deleteDoc_post);
app.post("/allUsers", docController.allUsers_post);
app.post("/shareDoc", docController.shareDoc_post);

const io = socket(server, {
  cors: {
    origin: "https://iamgauravbisht.github.io",
    methods: ["GET", "POST"],
  },
});

async function findOrCreateDocument(id, userId) {
  if (id == null || userId == null) return;

  const document = await Document.findById(id);
  if (document) {
    // await allDocsUpdateHandler(id, userId);
    await recentDocsUpdateHandler(id, userId);
    return document;
  } else {
    await allDocsUpdateHandler(id, userId);
    await recentDocsUpdateHandler(id, userId);
    return await Document.create({
      title: "Untitled",
      _id: id,
      owner: userId,
    });
  }
}

async function documentOwner(owner) {
  const _id = owner;
  const user = await User.findById(_id);
  return user.username;
}

function checkDocRole(document, userId) {
  if (document.owner == userId) return "owner";

  for (const sharedUser of document.sharedWithUsers) {
    if (sharedUser.user.toString() === userId) {
      if (sharedUser.rights === "read") return "read";
      if (sharedUser.rights === "read&write") return "read&write";
    }
  }

  return "unauthorized";
}

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId, userId) => {
    const document = await findOrCreateDocument(documentId, userId);
    const role = checkDocRole(document, userId);
    const owner = await documentOwner(document.owner);
    socket.join(documentId);
    socket.emit("load-document", document.delta, document.title, role, owner);

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
