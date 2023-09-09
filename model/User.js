const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    lowercase: true,
    minlength: [3, "Minimum username length is 3 characters"],
    maxlength: [16, "Maximum username length is 16 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    validation: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Minimum password length is 6 characters"],
    maxlength: [16, "Maximum password length is 16 characters"],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Define Document schema
const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: "",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  delta: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  sharedWithUsers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rights: [
        {
          type: String,
          enum: ["read", "write"], // possible values for rights are 'read' and 'write'
        },
      ],
    },
  ],
});

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  // console.log("user about to be created", this);

  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Create User model from User schema
const User = mongoose.model("User", userSchema);

// Create Document model from Document schema
const Document = mongoose.model("Document", documentSchema);

module.exports = { User, Document };
