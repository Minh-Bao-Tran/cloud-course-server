const express = require("express");

const routeController = require("@controller/route.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//Base Url => /routes
router.post("/", checkReqBody, routeController.addNewRoute);

router.post("/calc", checkReqBody, routeController.calcRoute);

// router.get("/all", routeController.logIn);

router.get("/:routeId", routeController.getOneRoute);

router.delete("/:routeId", routeController.deleteOneRoute);

router.put("/:routeId", routeController.updateRoute);

module.exports = router;
