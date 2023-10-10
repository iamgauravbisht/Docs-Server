const { Document, User } = require("../model/User");
const mongoose = require("mongoose");
const { allDocsUpdateHandler } = require("../middleware/middleware");

module.exports.search_get = async (req, res, next) => {
  next();
};
module.exports.all_get = async (req, res, next) => {
  try {
    const userId = req.query.userId; // Get the userId from query parameters

    // Find the user by userId and retrieve their recentDocs array
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let allDocsIds = user.allDocs || []; // Get recentDocs array from the user
    allDocsIds = Array.from(new Set(allDocsIds));

    const allDocs = await Promise.all(
      allDocsIds.map(async (docId) => {
        // Find each document by its ID and add it to the recentDocs array
        const document = await Document.findById(docId).exec();

        return document;
      })
    );

    res.json(allDocs.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  next();
};
module.exports.recent_get = async (req, res, next) => {
  try {
    const userId = req.query.userId; // Get the userId from query parameters

    // Find the user by userId and retrieve their recentDocs array
    const user = await User.findById(userId).exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let recentDocsIds = user.recentDocs || []; // Get recentDocs array from the user
    recentDocsIds.reverse();
    recentDocsIds = Array.from(new Set(recentDocsIds));

    const recentDocs = await Promise.all(
      recentDocsIds.map(async (docId) => {
        // Find each document by its ID and add it to the recentDocs array
        const document = await Document.findById(docId).exec();

        return document;
      })
    );

    res.json(recentDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  next();
};
module.exports.saveName_post = async (req, res, next) => {
  const documentId = req.body.id;
  const title = req.body.title;
  try {
    await Document.findByIdAndUpdate(documentId, { title: title });
    res.status(200).json({ message: "document name updated" });
  } catch (err) {
    res.status(400).json({ message: "document not found" });
  }
  next();
};
module.exports.deleteDoc_post = async (req, res, next) => {
  const documentId = req.body.id;
  try {
    await Document.findByIdAndRemove(documentId);
    res.status(200).json({ message: "document deleted" });
  } catch (err) {
    res.status(400).json({ message: "document not found" });
  }
  next();
};
module.exports.allUsers_post = async (req, res, next) => {
  const documentId = req.body.id;
  try {
    const document = await Document.findById(documentId);
    const sharedWithUsers = document.sharedWithUsers;
    const users = [];
    for (let i = 0; i < sharedWithUsers.length; i++) {
      const user = await User.findById(sharedWithUsers[i].user);
      users.push({
        id: user._id,
        username: user.username,
        rights: sharedWithUsers[i].rights,
      });
    }
    res.status(200).json({ users: users });
  } catch (err) {
    res.status(400).json({ message: "document not found" });
  }
  next();
};
module.exports.shareDoc_post = async (req, res, next) => {
  const _id = req.body.id; // document id
  const addUserId = req.body.addUserId;
  const rights = req.body.rights;

  try {
    if (!mongoose.isValidObjectId(addUserId)) {
      throw new Error("user not found");
    }
    const user = await User.findById(addUserId);
    if (!user) {
      throw new Error("user not found");
    }

    const document = await Document.findById(_id);
    if (!document) {
      throw new Error("document not found");
    }

    if (document.owner == addUserId) {
      throw new Error("user is owner");
    }

    if (
      document.sharedWithUsers.find(
        (sharedUser) => sharedUser.user == addUserId
      )
    ) {
      throw new Error("user already shared");
    }

    const documentUpdate = await Document.findByIdAndUpdate(
      _id,
      {
        $push: { sharedWithUsers: { user: addUserId, rights: rights } },
      },
      { new: true }
    );

    if (!documentUpdate) {
      throw new Error("document not found");
    }

    const updatingDocAtOtherUser = await allDocsUpdateHandler(_id, addUserId);
    if (!updatingDocAtOtherUser) {
      throw new Error("Internal server error X2");
    }
    res.status(200).json({ message: "document shared" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
