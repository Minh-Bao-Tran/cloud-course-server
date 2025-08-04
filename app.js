require("dotenv").config();

const express = require("express");

const cookieParser = require("cookie-parser");

const db = require("./data/database.js");

const authenticateMiddleware = require("./middleware/authenticate.middleware.js");
const errorHandlingMiddleware = require("./middleware/error.middleware.js");

const authRoutes = require("./routes/auth.route.js");

const app = express();

app.use(express.urlencoded({ extended: false })); // Help to parse the body if a request is of POST Method
app.use(express.json()); //Help to parse the request in JSON format
app.use(cookieParser()); //Help to parse the cookie

app.use("/auth", authRoutes);

app.use(authenticateMiddleware); // Any routes that requires authentication is behind this line

app.get("/test", function (req, res) {
  console.log();
  return res.send("success");
});

app.use(errorHandlingMiddleware); //Error handling middleware is always at the last position

db.connectToDatabase().then(function () {
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
  // db.getDb().collection("test").insertOne({ content: "test" });
});
