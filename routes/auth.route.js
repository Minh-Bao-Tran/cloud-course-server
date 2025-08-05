const express = require("express");

const userController = require("@controller/auth.controller.js");

const router = express.Router();

router.post("/signup", userController.signUp);

router.post("/login", userController.logIn);

module.exports = router;
