const db = require("../data/database.js");

const mongodb = require("mongodb");
const { getDistance, getGreatCircleBearing } = require("geolib");
const { addDecimalTime } = require("@util/timeUtil.js");

const Weather = require("@model/weather.model.js");
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
    this.waypoints = [...waypoints];
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
    this.distance = distance;
    this.time = time;
    this.active = active;
  }

  modifyAirportData() {
    this.departingAirport = this.departingAirport.toUpperCase();
    this.arrivingAirport = this.arrivingAirport.toUpperCase();
  }

  calcRelativeDirectionAndSpeed() {
    let newWaypoints = [];
    for (let i = 0; i <= this.waypoints.length - 2; i++) {
      // i - 1 as distance needs 2 points 2 calc, therefore the last point would not be valid for distance calc

      const currentPoint = this.waypoints[i];
      //Waypoint should already have weather

      const windSpeed = currentPoint.weather.windSpeed;
      const windDirection = currentPoint.weather.direction * (Math.PI / 180); //Converting to radians

      const finalDirection = currentPoint.direction * (Math.PI / 180);
      const aircraftSpeed = 120; //(cessna 172)

      console.log(currentPoint.weather);
      console.log(finalDirection, aircraftSpeed, windDirection, windSpeed);
      let aircraftTrueDirection =
        finalDirection +
        Math.PI -
        Math.asin(
          (windSpeed / aircraftSpeed) * Math.sin(finalDirection - windDirection)
        );

      let trueAirspeed =
        (windSpeed * Math.sin(windDirection) +
          aircraftSpeed * Math.sin(aircraftTrueDirection)) /
        Math.sin(finalDirection);
      if (trueAirspeed < 0) {
        //Reversed everything on the unit circle if the speed is negative
        aircraftTrueDirection = aircraftTrueDirection - Math.PI;
        trueAirspeed = -trueAirspeed;
      }
      const relativeAircraftDirInRadian =
        aircraftTrueDirection - finalDirection;

      const relativeAircraftDirInDegrees =
        (relativeAircraftDirInRadian / Math.PI) * 180;

      console.log(
        "relativeDir: ",
        relativeAircraftDirInDegrees,
        " trueAirspeed: ",
        trueAirspeed
      );

      const newWaypoint = {
        ...currentPoint,
        relativeAircraftDir: relativeAircraftDirInDegrees,
        airspeed: trueAirspeed,
      };
      newWaypoints.push(newWaypoint);
    }
    this.waypoints = [
      ...newWaypoints,
      this.waypoints[this.waypoints.length - 1],
    ];
    //Last waypoint is not valid for distance and angle calculation, so it should be added later
  }

  calcTrueDistanceAndSpeed() {
    let newWaypoints = [];

    let totalDistance = 0;
    for (let i = 0; i <= this.waypoints.length - 2; i++) {
      // i - 1 as distance needs 2 points 2 calc, therefore the last point would not be valid for distance calc
      //Point should contain lon and lat
      const currentPoint = {
        latitude: this.waypoints[i].latitude,
        longitude: this.waypoints[i].longitude,
      };
      const nextPoint = {
        latitude: this.waypoints[i + 1].latitude,
        longitude: this.waypoints[i + 1].longitude,
      };
      const distance = getDistance(currentPoint, nextPoint) / 1000 / 1.852;
      totalDistance += distance;
      //return point in meter, convert in to knot

      const direction = getGreatCircleBearing(currentPoint, nextPoint);

      //Update the information for waypoint
      const newWaypoint = {
        ...currentPoint,
        direction: direction,
        distance: distance,
      };
      newWaypoints.push(newWaypoint);
    }
    this.distance = totalDistance;
    this.waypoints = [
      ...newWaypoints,
      this.waypoints[this.waypoints.length - 1],
    ];
  }

  calcTime() {
    let newWaypoints = [];

    let totalTime = 0;
    for (let i = 0; i <= this.waypoints.length - 2; i++) {
      // i - 1 as distance needs 2 points 2 calc, therefore the last point would not be valid for distance calc
      //Point should contain lon and lat
      const currentPoint = this.waypoints[i];
      const time = currentPoint.distance / currentPoint.airspeed;

      totalTime += time;

      //Update the information for waypoint
      const newWaypoint = {
        ...currentPoint,
        time: time,
      };
      newWaypoints.push(newWaypoint);
    }
    this.time = totalTime;
    this.waypoints = [
      ...newWaypoints,
      this.waypoints[this.waypoints.length - 1],
    ];
  }

  calcArrivingTime() {
    const departingTime = this.departingDate;
    const time = this.time;

    const arrivingTime = addDecimalTime(departingTime, time, "hour")["$d"]; // get in the date format
    console.log(new Date());
    this.arrivingDate = arrivingTime;
  }

  async fetchWindDataForAllWaypoints() {
    const newWaypoints = [];
    for (const waypoint of this.waypoints) {
      let weather;
      try {
        const result = await Weather.fetchWeather({
          latitude: waypoint.latitude,
          longitude: waypoint.longitude,
        });
        if (!result.valid) {
          //result is not valid
          return {
            success: false,
            error: "Something went wrong, cannot fetch weather",
          };
        }

        weather = result.weather;
      } catch (error) {
        return { success: false, error: error };
      }
      const newWaypoint = { ...waypoint, weather: weather };
      newWaypoints.push(newWaypoint);
    }
    this.waypoints = newWaypoints;
    return { success: true };
  }

  async addAirportToWaypoints() {
    const departingAirport = await Route.fetchAirportByIATA(
      this.departingAirport
    );
    const arrivingAirport = await Route.fetchAirportByIATA(
      this.arrivingAirport
    );

    //data from the airport, the key is shortened as for the API

    this.waypoints.push({
      longitude: departingAirport.lon,
      latitude: departingAirport.lat,
    });
    this.waypoints.push({
      longitude: arrivingAirport.lon,
      latitude: arrivingAirport.lat,
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

  static async deleteOneRoute(userId, routeId){
        const result = await db
      .getDb()
      .collection("routes")
      .deleteOne({ _id: routeId, userId: userId });

    return result;
  }
}

module.exports = Route;
