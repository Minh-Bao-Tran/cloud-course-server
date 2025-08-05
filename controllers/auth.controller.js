const { sign } = require("jsonwebtoken");
const createError = require("http-errors");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");

const validateJs = require("@util/validateUserData.js");

const User = require("@model/user.model.js");

async function signUp(req, res, next) {
  const userData = req.body;

  //Body is missing
  if (!req.body) {
    let err = createError(400, "Req.body is missing");
    return next(err);
  }

  // Return if Confirmed password doesn't match
  const validation = validateJs.validateUserData(userData);
  if (validation.valid === false) {
    //Data is not valid
    const message = {
      message: validation.message,
    };
    const err = createError(400, message);
    return next(err);
  }

  // try hashing the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(userData.password, 10);
  } catch {
    let err = createError(500, "password could not be hashed");
    return next(err);
  }

  // Password is already hashed
  // Creating ObjectID for the user
  const _id = new mongodb.ObjectId(); // create a new objectID

  // Create a user object in the User model format
  const user = new User(
    userData.userName,
    hashedPassword,
    userData.email,
    userData.mobile,
    _id
  );

  let result;
  try {
    result = await user.signUpUser();
  } catch (error) {
    return next(createError(500, "Sign up failed."));
  }

  return res.json(JSON.stringify({ message: result, success: true }));
}

module.exports = {
  signUp: signUp,
};
