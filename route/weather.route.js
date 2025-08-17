const express = require("express");

const weatherController = require("@controller/weather.controller.js");
const router = express.Router();

//Base Url => /weather
router.put("/", weatherController.updateAllWeather);

router.get("/", weatherController.get4RandomWeather);

module.exports = router;
