const { Document, User } = require("../model/User");

module.exports.create_post = async (req, res, next) => {
  const title = "Untitled";
  const _id = req.body.id;
  const owner = req.body.userId;
  //createDoc
  try {
    const doc = await Document.create({ title, _id, owner });
    res.status(201).json({ doc: doc._id });
  } catch (err) {
    res.status(400).json({ err });
  }

  next();
};
module.exports.update_post = async (req, res, next) => {
  const { id, delta } = req.body;
  //updateDoc
  try {
    // Use findByIdAndUpdate to update the document
    const updatedDoc = await document.findByIdAndUpdate(
      { _id: id }, // The ID of the document you want to update
      { delta: delta }, // The updated data you want to set
      { new: true } // { new: true } ensures that the updated document is returned
    );

    if (!updatedDoc) {
      console.log("Document not found.");
      res.status(404).json({ err: "Document not found." });
      return;
    }
    // The updated document is now in updatedDocument
    // console.log("Updated Document:", updatedDoc);
    res.status(201).json({ doc: updatedDoc._id });
  } catch (error) {
    console.log(error);
    res.status(400).json({ err: error });
  }

  next();
};
module.exports.delete_get = async (req, res, next) => {
  const { name } = req.body;
  //createDoc

  next();
};
module.exports.edit_get = async (req, res, next) => {
  //createDoc

  next();
};
module.exports.search_get = async (req, res, next) => {
  //createDoc

  next();
};
module.exports.all_post = async (req, res, next) => {
  const documentId = req.body.id;
  const _id = req.body.userId;

  try {
    if (!newData || !_id) {
      return res
        .status(400)
        .json({ error: "Both documentId and userId are required." });
    }
    // Use findByIdAndUpdate to update the document
    const updatedDocument = await User.findByIdAndUpdate(
      _id, // The _id of the document you want to update
      // [documentId, ...allDocs], // The updated data you want to set
      { $push: { allDocs: documentId } },
      { new: true } // { new: true } ensures that the updated document is returned
    );

    if (!updatedDocument) {
      console.log("Document not found.");
      return;
    }
    // The updated document is now in updatedDocument
    res.status(200).json({ updatedDocument });
  } catch (error) {
    res.status(400).json({ message: "allDocs_post not working" });
  }

  next();
};
module.exports.recent_post = async (req, res, next) => {
  //recentDoc
  const documentId = req.body.id;
  const _id = req.body.userId;

  try {
    if (!documentId || !_id) {
      return res
        .status(400)
        .json({ error: "Both documentId and userId are required." });
    }
    // Use findByIdAndUpdate to update the document
    const updatedDocument = await User.findByIdAndUpdate(
      _id, // The _id of the document you want to update
      // [documentId, ...allDocs], // The updated data you want to set
      { $push: { recentDocs: documentId } },
      { new: true } // { new: true } ensures that the updated document is returned
    );

    if (!updatedDocument) {
      console.log("Document not found.");
      return;
    }
    // The updated document is now in updatedDocument
    res.status(200).json({ updatedDocument });
  } catch (error) {
    res.status(400).json({ message: "recentDocs_post not working" });
  }

  next();
};
