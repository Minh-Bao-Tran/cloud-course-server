const express = require("express");

const aircraftController = require("@controller/aircraft.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//baseURL => /aircrafts

router.get("/", aircraftController.getAllUserAircraft);

router.post("/", checkReqBody, aircraftController.addAircraft);

router.get("/:aircraftId", aircraftController.getOneAircraft);

module.exports = router;
