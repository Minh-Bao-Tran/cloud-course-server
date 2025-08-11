const express = require("express");

const routeController = require("@controller/route.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//Base Url => /routes
router.post("/new", checkReqBody, routeController.addNewRoute);

// router.get("/all", routeController.getOneRoute);

// router.get("/:routeId", routeController.logIn);

module.exports = router;
