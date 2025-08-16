const express = require("express");

const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const staticController = require("@controller/static.controller.js");

const router = express.Router();

//fetch all airport once just for the database
// Note:

router.post("/fetchAllAirports", staticController.addAllAirports);

router.post("/waypoint", checkReqBody, staticController.addOneWaypoint);
module.exports = router;
