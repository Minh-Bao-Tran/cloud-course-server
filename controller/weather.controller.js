const Weather = require("@model/weather.model.js");
const Waypoint = require("@model/waypoint.model.js");
const createHttpError = require("http-errors");

async function updateAllWeather(req, res, next) {
    const waypointList = await Waypoint.fetchAllWaypoint();

    for (const waypoint of waypointList) {
        const newWeatherResult = await Weather.fetchWeather({ latitude: waypoint.latitude, longitude: waypoint.longitude });
        let newWeather;
        if (!newWeatherResult.valid) {
            return next(createHttpError(500, newWeatherResult.message));
        }

        newWeather = newWeatherResult.weather;
        newWeather._id = waypoint.weatherId;
        const result = await newWeather.updateWeather();
        if (!result.acknowledged) {
            return next(createHttpError(400, "Update weather failed"));
        }
    }
    res.json(JSON.stringify({ success: true }));
};

async function get4RandomWeather(req, res, next) {
    const weatherList = await Weather.fetchRandomWeather(4);
    res.json(JSON.stringify({ weather: weatherList }));
}

module.exports = {
    updateAllWeather: updateAllWeather,
    get4RandomWeather: get4RandomWeather
};