const express = require("express");

const jwt = require("jsonwebtoken");

const userController = require("@controller/auth.controller.js");

const router = express.Router();

router.post("/signup", userController.signUp);

router.post("/login", function (req, res) {
  const token = jwt.sign(
    { isAuth: true, user: "Matt" },
    process.env.SECRET_KEY,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    }
  );
  //jwt.sign would return an encoded token

  //   return res.json(JSON.stringify({ a: token }));
  return res.send(token);
});

module.exports = router;
