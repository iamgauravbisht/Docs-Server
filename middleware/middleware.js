const { User } = require("../model/User");

module.exports.allDocsUpdateHandler = async (documentId, _id) => {
  try {
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
    return updatedDocument;
  } catch (err) {
    console.log("allDocsUpdateHandler not working");
  }
};

module.exports.recentDocsUpdateHandler = async (documentId, _id) => {
  try {
    // Use findByIdAndUpdate to update the document
    const updatedDocument = await User.findByIdAndUpdate(
      _id, // The _id of the document you want to update
      { $push: { recentDocs: documentId } },
      { new: true } // { new: true } ensures that the updated document is returned
    );

    if (!updatedDocument) {
      console.log("Document not found.");
      return;
    }
  } catch (err) {
    console.log("recentDocsUpdateHandler not working");
  }
};
