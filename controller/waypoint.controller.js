const Waypoint = require("@model/waypoint.model.js");

async function getAllWaypoints(req, res, next) {
    const result = await Waypoint.fetchAllWaypoint();
    for (const waypoint of result) {
        await waypoint.fetchWeatherForWaypoint();
    }
    res.json(JSON.stringify({ waypoints: result }));
}

module.exports = {
    getAllWaypoints: getAllWaypoints
};