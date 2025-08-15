const express = require("express");

const routeController = require("@controller/route.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//Base Url => /routes
router.post("/new", checkReqBody, routeController.addNewRoute);

// router.get("/all", routeController.logIn);

router.get("/:routeId", routeController.getOneRoute);


module.exports = router;
