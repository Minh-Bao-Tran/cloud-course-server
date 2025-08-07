const express = require("express");

const aircraftController = require("@controller/aircraft.controller.js");
const checkReqBody = require("@middleware/checkReqBody.middleware.js");

const router = express.Router();

//baseURL => /airport
router.get("/:aircraftId", (req, res) => {
  res.send("not supported");
});

router.post("/new", checkReqBody, aircraftController.addAircraft);

module.exports = router;
