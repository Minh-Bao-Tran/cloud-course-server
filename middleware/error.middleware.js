function errorHandlingMiddleware(err, req, res, next) {
  console.log(err);
  const errorCode = err.status ? err.status : 500;
  const errorMessage =
    err.status === 500 ? "Something went wrong" : err.message;
    
  res.status(errorCode).json({ message: errorMessage });
}

module.exports = errorHandlingMiddleware;
