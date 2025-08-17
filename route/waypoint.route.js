const express = require("express");

const waypointController = require("@controller/waypoint.controller.js");
const router = express.Router();

//Base Url => /waypoints

router.get("/", waypointController.getAllWaypoints);

module.exports = router;
