const express = require("express");

const userController = require("@controller/auth.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//Base Url => /auth
router.post("/signup", checkReqBody, userController.signUp);

router.post("/login", checkReqBody, userController.logIn);

module.exports = router;
