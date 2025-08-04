const jwt = require("jsonwebtoken");
const createError = require("http-errors");

function authenticate(req, res, next) {
  const bearerToken = req.headers.authorization; // Bare value received in header
  const authToken = bearerToken && bearerToken.replace("Bearer ", ""); //Check if the token exist. if yes, cut the Bearer part from the Bearer format and pass it on

  if (!authToken) {
    return next(createError(401, "User is not authenticated"));
  }

  let result;
  try {
    result = jwt.verify(authToken, process.env.SECRET_KEY, {
      algorithms: "HS256",
    });
  } catch (error) {
    next(createError(401, "User is not authenticated"));
  }

  req.userData = result; //Add userData to request so it is easily accessed by other middleware/routes

  next();
}

module.exports = authenticate;
