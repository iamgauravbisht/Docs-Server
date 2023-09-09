const { User } = require("../model/User");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, "gb secret", {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

const handleErrors = (err) => {
  console.log("error handler", err);
  // console.log(err.message, "this is error code", err.code);
  let errors = { username: "", email: "", password: "" };

  // Check if err object and errors property exist
  if (err && err.errors) {
    //incorrect email
    if (err.errors.email) {
      errors.email = err.errors.email.message;
    }

    //incorrect password
    if (err.errors.password) {
      errors.password = err.errors.password.message;
    }
    //validation errors
    console.log(err.message);
    // if (err.message.includes("user validation failed")) {
    //   Object.values(err.errors).forEach(({ properties }) => {
    //     errors[properties.path] = properties.message;
    //   });
    // }
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.email = "that email is already registered";
  }
  return errors;
};

module.exports.signup_post = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const user = await User.create({ username, email, password });

    const token = createToken(user._id);

    res.cookie("jwt", token, {
      secure: false,
      httpOnly: true,
      sameSite: "None",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: user._id });
  } catch (err) {
    // Pass the error to the next middleware or error handler
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};
