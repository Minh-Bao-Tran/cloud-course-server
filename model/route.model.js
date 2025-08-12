const db = require("../data/database.js");

const mongodb = require("mongodb");
const { getDistance, getGreatCircleBearing } = require("geolib");

const { fetchWeather } = require("@util/weatherUtil.js");

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
    this.arrivingDate = new Date(arrivingDate);
    this.departingDate = new Date(departingDate);
    this.aircraftId = aircraftId;
    this.userId = userId;
    this.waypoints = [...waypoints];
    // final waypoint would be of the format:
    // {
    //   lat: float,
    //   lon: float
    //   distance: float, knot
    //   direction: float, compass bearing
    //   relativeAircraftDir: to keep the course, to direction
    //   weather: {
    //     message: condition.text from API
    //     windSpeed: float, knot,
    //     direction: compass, bearing
    //     cloud: ;
    //     gust: knot
    //     visibility: in km
    //   }
    // }
    this.distance = distance;
    this.active = active;
  }

  modifyAirportData() {
    this.departingAirport = this.departingAirport.toUpperCase();
    this.arrivingAirport = this.arrivingAirport.toUpperCase();
  }

  calcAllDistanceAndDirection() {
    let newWaypoints = [];

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
      const distance = getDistance(currentPoint, nextPoint) / 1000 / 1.852;
      //return point in meter, convert in to knot
      const direction = getGreatCircleBearing(currentPoint, nextPoint);

      totalDistance += distance;

      const newWaypoint = {
        ...currentPoint,
        direction: direction,
        distance: distance,
      };
      newWaypoints.push(newWaypoint);
    }
    this.distance = totalDistance;
    this.waypoints = newWaypoints;
  }

  async fetchWindDataForAllWaypoints() {
    this.waypoints = this.waypoints.map(async function (waypoint) {
      let weather;
      try {
        weather = await fetchWeather({ lat: waypoint.lat, lon: waypoint.lon });
      } catch (error) {
        return { success: false, error: error };
      }

      const newWaypoint = { ...waypoint };
    });
  }

  async addAirportToWaypoints() {
    const arrivingAirport = await Route.fetchAirportByIATA(
      this.arrivingAirport
    );
    const departingAirport = await Route.fetchAirportByIATA(
      this.departingAirport
    );
    console.log(arrivingAirport);
    this.waypoints.push({ lon: arrivingAirport.lon, lat: arrivingAirport.lat });
    this.waypoints.push({
      lon: departingAirport.lon,
      lat: departingAirport.lat,
    });
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
