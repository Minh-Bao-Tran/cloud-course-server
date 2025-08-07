const { sign } = require("jsonwebtoken");
const createError = require("http-errors");
const mongodb = require("mongodb");
const bcrypt = require("bcryptjs");

const validateUtil = require("@util/validateUtil.js");

const User = require("@model/user.model.js");

async function signUp(req, res, next) {
  // Return if data is not valid
  const validation = validateUtil.validateUserData(req.body);
  if (validation.valid === false) {
    //Data is not valid
    const message = {
      message: validation.message,
    };
    const err = createError(400, message);
    return next(err);
  }

  // Trim spaces
  const userData = validateUtil.trimUserData(req.body);

  // check if userName exist
  let existingUserName;

  try {
    existingUserName = await User.fetchUserByUserName(userData.userName);
  } catch (error) {
    const err = createError(400);
    return next(err);
  }
  if (existingUserName) {
    //username already exists
    const err = createError(409);
    return next(err);
  }

  //check if email exist
  let existingEmail;
  try {
    existingEmail = await User.fetchUserByEmail(userData.email);
  } catch (error) {
    const err = createError(400, "Username already exists");
    return next(err);
  }
  if (existingEmail) {
    //Email already exists
    const err = createError(409, "Email already exists");
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


  return res.json(JSON.stringify({ success: true }));
}

async function logIn(req, res, next) {
  const userData = req.body;
  //Body is missing
  if (!req.body) {
    let err = createError(400, "Req.body is missing");
    return next(err);
  }

  //checking password exists in req.body
  if (!userData.password) {
    return next(createError(400));
  }

  //check the way of logging in
  let loginType;
  if (req.body.userName) {
    //Username field exist
    loginType = "userName";
  } else if (req.body.email) {
    //Email field exist
    loginType = "email";
  } else {
    //No logging in field is provided
    return next(createError(400));
  }
  let existingUser;
  try {
    if (loginType == "userName") {
      //logging in with userName
      existingUser = await User.fetchUserByUserName(userData.userName);
    } else {
      //logging in with email
      existingUser = await User.fetchUserByEmail(userData.email);
    }
  } catch (error) {
    return next(
      createError(400, "Either Email or Username or Password is incorrect")
    );
  }

  if (!existingUser) {
    //user does not exist
    return next(createError(409, "user does not exist"));
  }

  //checking password
  const existingUserPassword = existingUser.hashedPassword;

  let comparePassword;
  try {
    comparePassword = await bcrypt.compare(
      userData.password,
      existingUserPassword
    );
  } catch (error) {
    return next(createError(500));
  }

  if (!comparePassword) {
    //Password does not match
    return next(
      createError(400, "Either Email or Username or Password is incorrect")
    );
  }

  //Password is matched

  const payload = {
    isAuth: true,
    user: {
      userName: existingUser.userName,
      email: existingUser.email,
      _id: existingUser._id,
    },
  };
  const token = sign(payload, process.env.SECRET_KEY, {
    algorithm: "HS256",
    expiresIn: "1h",
  });
  //jwt.sign would return an encoded token

  const result = {
    success: true,
    token: token,
  };
  return res.json(JSON.stringify(result));
}

module.exports = {
  signUp: signUp,
  logIn: logIn,
};
