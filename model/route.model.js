const db = require("../data/database.js");

const mongodb = require("mongodb");
const { getDistance, getGreatCircleBearing } = require("geolib");
const { addDecimalTime } = require("@util/timeUtil.js");

const Weather = require("@model/weather.model.js");
const Waypoint = require("@model/waypoint.model.js");

class Route {
  constructor (
    departingAirport, //Airport Code
    arrivingAirport, //Airport Code
    legs, //An array containing objects with property of Lat and Lon
    departingDate, //String, to be converted into Date Object
    arrivingDate, //String, to be converted into Date Object
    aircraftId, //ObjectId
    userId, //ObjectId
    _id = new mongodb.ObjectId(),
    distance = 0,
    time = 0,
    active = false
  ) {
    this._id = _id;
    this.departingAirport = departingAirport;
    this.arrivingAirport = arrivingAirport;
    this.arrivingDate = new Date(arrivingDate);
    this.departingDate = new Date(departingDate);
    this.aircraftId = aircraftId;
    this.userId = userId;
    this.legs = legs;
    // 
    this.distance = distance;
    this.time = time;
    this.active = active;
  }

  calcTotalDistance() {
    let totalDistance = 0;
    for (const leg of this.legs) {
      totalDistance += leg.distance;
    }
    this.distance = totalDistance;
  }

  calcTotalTime() {
    let totalTime = 0;
    for (const leg of this.legs) {
      totalTime += leg.time;
    }
    this.time = totalTime;
  }

  calcArrivingTime() {
    const departingTime = this.departingDate;
    const time = this.time;

    const arrivingTime = addDecimalTime(departingTime, time, "hour")["$d"]; // get in the date format
    this.arrivingDate = arrivingTime;
  }

  normalizeLegs() {
    //Normalise leg for 
    for (const leg of this.legs) {
      leg.normalizeLeg();
    }
  }

  async addRoutes(collection = "routes") {
    const result = await db.getDb().collection(collection).insertOne(this);
    return result;
  }

  async updateRoutes(collection = "routes") {
    const { _id, userId, ...restOfDocument } = this;
    const result = await db.getDb().collection(collection).updateOne({ _id: this._id }, { $set: restOfDocument });
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
      .collection("waypoints")
      .findOne({ name: iataCode });
    return result;
  }

  static async deleteOneRoute(userId, routeId) {
    const result = await db
      .getDb()
      .collection("routes")
      .deleteOne({ _id: routeId, userId: userId });

    return result;
  }
}

module.exports = Route;
