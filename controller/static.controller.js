const createHttpError = require("http-errors");

const db = require("../data/database.js");
const Waypoint = require("@model/waypoint.model.js");
const Weather = require("@model/weather.model.js");

async function addAllAirports(req, res, next) {
    let existingAirports;

    try {
        existingAirports = await db.getDb().collection("airportStatic").findOne({});
    } catch (error) {
        return next(error);
    }

    if (existingAirports) {
        return next(createHttpError(400, "Data already existed"));
    }

    console.log(existingAirports);

    let response;
    try {
        response = await fetch(
            "https://flightradar24-com.p.rapidapi.com/v2/airports/list",
            {
                method: "GET",
                headers: {
                    "x-rapidapi-key":
                        "39ea5bf926msh2cb3030103be360p1e5d89jsncc0c878e486e",
                    "x-rapidapi-host": "flightradar24-com.p.rapidapi.com",
                },
            }
        );
    } catch (error) {
        return next(error);
    }

    let data;
    try {
        data = await response.json();
    } catch (error) {
        return next(createHttpError(500));
    }

    const allMajorAirports = data.rows.filter((airport) => {
        //Keep the airport if the airport size is > 200000 or it is in Australia
        if (airport.size > 200000 || airport.country === "Australia") {
            return true;
        }
        return false;
    });
    // console.log(allMajorAirports);
    const result = await db
        .getDb()
        .collection("airportStatic")
        .insertMany(allMajorAirports);

    res.json(JSON.stringify({ result: result }));
}

async function addOneWaypoint(req, res, next) {

    const fetchWeather = await Weather.fetchWeather({ latitude: req.body.latitude, longitude: req.body.longitude });

    let weather;
    if (!fetchWeather.valid) {
        // weather is not valid
        return next(createHttpError(400, "Could not get weather"));
    }
    weather = fetchWeather.weather;

    //return a weather object, link to waypoint object after

    const waypoint = new Waypoint(req.body.latitude, req.body.longitude, req.body.name, weather._id);

    let waypointResult;
    try {
        waypointResult = await waypoint.addWaypoint();

    } catch (error) {
        return next(error);
    }

    let weatherResult;
    try {
        weatherResult = await weather.addWeather();
    } catch (error) {
        return next(error);
    }
    res.json(JSON.stringify({ result: waypointResult.acknowledged && weatherResult.acknowledged }));
}

module.exports = {
    addAllAirports: addAllAirports,
    addOneWaypoint: addOneWaypoint
};