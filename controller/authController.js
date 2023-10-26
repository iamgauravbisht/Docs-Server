const { User } = require("../model/User");
const jwt = require("jsonwebtoken");

const createToken = (id) => {
  return jwt.sign({ id }, "gb secret", {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

const handleErrors = (err) => {
  console.log("error handler ", err);
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

    //validation errors for username
    if (err.message.includes("User validation failed")) {
      errors.username = err.errors.username.message;
    }
  }

  //login errors
  if (err.message == "Incorrect password") {
    errors.password = err.message;
  }
  if (err.message == "Incorrect email") {
    errors.email = err.message;
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
      httpOnly: true,
      secure: true,
      SameSite: "Lax",
      // domain: ".docserver-ecsy.onrender.com",
      // path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: user._id });
  } catch (err) {
    // Pass the error to the next middleware or error handler
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.verifyAuth_get = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "gb secret", async (err, decodedToken) => {
      if (err) {
        console.log("error verifying token");
        console.log(err.message);
        res.json({ errors: "error verifying token" });
      } else {
        console.log("decodedToken", decodedToken);
        let user = await User.findById(decodedToken.id);
        res.json({ user });
      }
    });
  } else {
    console.log("no token");
    res.json({ errors: "no token" });
  }
};

module.exports.login_post = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);

    const token = createToken(user._id);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: true,
      SameSite: "Lax",
      // domain: ".docserver-ecsy.onrender.com",
      // path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res, next) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    secure: true,
    SameSite: "Lax",
    // domain: ".docserver-ecsy.onrender.com",
    // path: "/",
    maxAge: 1,
  });
  res.json({ message: "logged out" });
};

module.exports.Me = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "gb secret", async (err, decodedToken) => {
      if (err) {
        console.log("error verifying token");
        console.log(err.message);
        res.redirect("https://iamgauravbisht.github.io/gauravdocs");
        res.json({ errors: "error verifying token" });
      } else {
        console.log("decodedToken", decodedToken);
        const User = await User.findById(decodedToken.id);
        const user = {
          email: User.email,
          username: User.username,
          date: User.date,
          id: User._id,
        };
        res.json({ user });
      }
    });
  } else {
    res.redirect("https://iamgauravbisht.github.io/gauravdocs");
    res.json({ errors: "no token" });
  }
};
