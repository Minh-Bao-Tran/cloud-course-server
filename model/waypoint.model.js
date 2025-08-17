const mongodb = require("mongodb");

const db = require("../data/database.js");

const Weather = require("@model/weather.model.js");

class Waypoint {
    constructor (latitude, longitude, name, weatherId, _id = new mongodb.ObjectId()) {
        this._id = _id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.weatherId = weatherId;
        this.weather = {};
        // final waypoint would be of the format:
        // {
        //   latitude: float,
        //   longitude: float
        //   distance: float, knot
        //   direction: float, compass bearing
        //   relativeAircraftDir: to keep the course, to direction
        //   airspeed: = aircraft speed + windSpeed, using vector addition(both of the are vector quantities)
        //   weather: {
        //     message: condition.text from API
        //     windSpeed: float, knot,
        //     direction: compass, bearing
        //     cloud: ;
        //     gust: knot
        //     visibility: in km
        //   }
        // }
    }
    async addWaypoint(collection = "waypoints") {
        delete this.weather;
        const result = await db.getDb().collection(collection).insertOne(this);
        return result;
    }
    static async fetchWaypointById(waypointId) {
        //Waypoint Id is already in ObjectId 
        const result = await db
            .getDb()
            .collection("waypoints")
            .findOne({ _id: waypointId });
        return new Waypoint(
            result.latitude,
            result.longitude,
            result.name,
            result.weatherId,
            result._id);
    }
    static async fetchAllWaypoint() {
        const result = await db
            .getDb()
            .collection("waypoints")
            .find({}).toArray();

        const resultWaypoint = result.map((waypoint => new Waypoint(
            waypoint.latitude,
            waypoint.longitude,
            waypoint.name,
            waypoint.weatherId,
            waypoint._id)));

        return resultWaypoint;
    }

    async fetchWeatherForWaypoint() {
        let weather;
        try {
            const weatherObjectId = new mongodb.ObjectId(this.weatherId);
            const result = await Weather.fetchWeatherById(weatherObjectId);
            if (!result.valid) {
                //result is not valid
                return {
                    success: false,
                    error: "Something went wrong, cannot fetch weather",
                };
            }

            weather = result.weather;
            //result is an object with key valid and weather
        } catch (error) {
            return { success: false, error: error };
        }

        //Weather is successfully fetched
        this.weather = weather;

        return { success: true };
    }
}

module.exports = Waypoint;