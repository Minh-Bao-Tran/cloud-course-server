const express = require("express");

const aircraftController = require("@controller/aircraft.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//baseURL => /aircrafts

router.get("/all", aircraftController.getAllUserAircraft);

router.get("/:aircraftId", aircraftController.getOneAircraft);

router.post("/new", checkReqBody, aircraftController.addAircraft);

module.exports = router;
