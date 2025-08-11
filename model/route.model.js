const db = require("../data/database.js");

const mongodb = require("mongodb");
const { getDistance } = require("geolib");

class Route {
  constructor(
    departingAirport, //Airport Code
    arrivingAirport, //Airport Code
    waypoints, //An array containing objects with property of Lat and Lon
    departingDate, //String, to be converted into Date Object
    arrivingDate, //String, to be converted into Date Object
    aircraftId, //ObjectId
    userId, //ObjectId
    _id, //ObjectId
    distance = 0,
    active = false
  ) {
    this._id = _id;
    this.departingAirport = departingAirport;
    this.arrivingAirport = arrivingAirport;
    this.arrivingAirport = arrivingAirport;
    this.arrivingDate = new Date(arrivingDate);
    this.departingDate = new Date(departingDate);
    this.aircraftId = aircraftId;
    this.userId = userId;
    this.waypoints = [...waypoints];
    this.distance = distance;
    this.active = active;
  }

  async addAirportToWaypoints() {
    const arrivingAirport = await Route.fetchAirportByIATA(
      this.arrivingAirport
    );
    const departingAirport = await Route.fetchAirportByIATA(
      this.departingAirport
    );
    this.waypoints.push({ lon: arrivingAirport.lon, lat: arrivingAirport.lat });
    this.waypoints.push({
      lon: departingAirport.lon,
      lat: departingAirport.lat,
    });
  }
  calculateDistance() {
    let totalDistance = 0;
    for (let i = 0; i <= this.waypoints.length - 2; i++) {
      // i - 1 as distance needs 2 points 2 calc, therefore the last point would not be valid for distance calc
      //Point should contain lon and lat
      const currentPoint = {
        latitude: this.waypoints[i].lat,
        longitude: this.waypoints[i].lon,
      };
      const nextPoint = {
        latitude: this.waypoints[i + 1].lat,
        longitude: this.waypoints[i + 1].lon,
      };
      const distance = getDistance(currentPoint, nextPoint);
      //return point in meter
      totalDistance += distance / 1000 / 1.852;
      //total distance is in knot
    }
    this.distance = totalDistance;
  }

  async addRoutes(collection = "routes") {
    const result = await db.getDb().collection(collection).insertOne(this);
    return result;
  }

  static async fetchRouteByUserId(userId) {
    const result = await db
      .getDb()
      .collection("routes")
      .find({ userId: userId })
      .toArray();
    return result;
  }

  static async fetchRouteByAircraftId(userId, aircraftId) {
    const result = await db
      .getDb()
      .collection("routes")
      .findOne({ _id: aircraftId, userId: userId });

    return result;
  }

  static async fetchRouteByRouteId(userId, routeId) {
    const result = await db
      .getDb()
      .collection("routes")
      .findOne({ _id: routeId, userId: userId });

    return result;
  }

  static async fetchAirportByIATA(iataCode) {
    const result = await db
      .getDb()
      .collection("airportStatic")
      .findOne({ iata: iataCode });
    return result;
  }
}

module.exports = Route;
