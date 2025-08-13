const createError = require("http-errors");

function checkReqBody(req, res, next) {
  // console.log(req.body);
  if (!req.body) {
    return next(createError(400, "Req.body is missing"));
  }
  return next();
}

module.exports = checkReqBody;
