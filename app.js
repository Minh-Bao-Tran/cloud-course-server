require("dotenv").config();

const express = require("express");

const cookieParser = require("cookie-parser");
const { auth } = require("express-oauth2-jwt-bearer");
const jwt = require("jsonwebtoken");

const db = require("./data/database.js");

const authRoutes = require("./routes/auth.route.js");

const app = express();

app.use(express.urlencoded({ extended: false })); // Help to parse the body if a request is of POST Method
app.use(express.json()); //Help to parse the request in JSON format
app.use(cookieParser()); //Help to parse the cookie

app.use("/auth", authRoutes);

app.use(function (req, res, next) {
  const authToken = req.headers.authorization.replace("Bearer ", "");
  console.log(authToken);
  if (!authToken) {
    return res.send("user is not authorised");
  }
  const result = jwt.verify(authToken, process.env.SECRET_KEY, {
    algorithms: "HS256",
  });
  console.log(result);
  if (!result) {
    return res.send("not authorised");
  } else {
    next();
  }
});

app.get("/test", function (req, res) {
  console.log();
  return res.send("success");
});

db.connectToDatabase().then(function () {
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
  // db.getDb().collection("test").insertOne({ content: "test" });
});
