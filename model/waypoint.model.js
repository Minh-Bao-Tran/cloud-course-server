const mongodb = require("mongodb");

const db = require("../data/database.js");


class Waypoint {
    constructor (latitude, longitude, name, weatherId, _id = new mongodb.ObjectId()) {
        this._id = _id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.weatherId = weatherId;
    }
    async addWaypoint(collection = "waypoints") {
        const result = await db.getDb().collection(collection).insertOne(this);
        return result;
    }
    async fetchWaypointById(waypointId) {
        const result = await db
            .getDb()
            .collection("waypoints")
            .findOne({ _id: waypointId });

        return result;
    }
    async fetchWaypointByAirportName(airportName){
        
    }
}

module.exports = Waypoint;