//handle errors function
module.exports.handleErrors = (req, res, err, next) => {
  console.log("error handler", err);
  console.log(err.message, "this is error code", err.code);
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
  res.json({ errors });
  next();
};
