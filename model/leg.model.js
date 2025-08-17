const mongodb = require("mongodb");

const db = require("../data/database.js");
const Waypoint = require("@model/waypoint.model.js");

const { getDistance, getGreatCircleBearing } = require("geolib");


class Leg {
    constructor (startingWaypointId, endingWaypointId, time = null, distance = null, relativeAircraftDir = null, airspeed = null) {
        this.startingWaypointId = new mongodb.ObjectId(startingWaypointId);
        this.startingWaypoint = {};
        this.endingWaypointId = new mongodb.ObjectId(endingWaypointId);
        this.endingWaypoint = {};
        this.time = time; //default null
        this.distance = distance; //default null
        this.relativeAircraftDir = relativeAircraftDir;//Default null
        this.airspeed = airspeed; //default null
        // float, knot;
        //   direction: float, compass bearing
        //   relativeAircraftDir: to keep the course, to direction
        //   airspeed: = aircraft speed + windSpeed, using vector addition(both of the are vector quantities)
    }
    static async transformNormalisedLegIntoLeg(normalizeLegList) {
        const legList = [];
        for (const normalizeLeg of normalizeLegList) {
            const startingWaypointId = normalizeLeg.startingWaypointId;
            const endingWaypointId = normalizeLeg.endingWaypointId;
            const currentLeg = await Leg.createAndInitLeg(startingWaypointId, endingWaypointId);
            if (!currentLeg.success) {
                return { success: false, message: `Can not create Leg ${i}. ` + error };
            }
            legList.push(currentLeg.currentLeg);
        }
        return { success: true, legList: legList };
    }
    static async transformWaypointIntoLeg(waypointList) {
        //Each waypoint here would only be a waypointId 
        const legList = [];
        for (let i = 0; i <= waypointList.length - 2; i++) {
            const startingWaypointId = waypointList[i];
            const endingWaypointId = waypointList[i + 1];
            const currentLeg = await Leg.createAndInitLeg(startingWaypointId, endingWaypointId);
            if (!currentLeg.success) {
                return { success: false, message: `Can not create Leg ${i}. ` + error };
            }
            legList.push(currentLeg.currentLeg);
        }
        return { success: true, legList: legList };
    }

    static async createAndInitLeg(startingWaypointId, endingWaypointId) {
        const currentLeg = new Leg(startingWaypointId, endingWaypointId);
        //Leg is created
        try {
            currentLeg.startingWaypoint = await Waypoint.fetchWaypointById(startingWaypointId);
            //Waypoint is already in ObjectId
            currentLeg.endingWaypoint = await Waypoint.fetchWaypointById(endingWaypointId);
        } catch (error) {
            return { success: false, error: error };
        }

        if (!currentLeg.startingWaypoint || !currentLeg.endingWaypoint) {
            //Waypoint does not exist
            return { success: false, error: "Waypoint does not exist" };
        }

        //Calc distance and speed
        currentLeg.calcTrueDistanceAndDirection();

        //2 of the Waypoint is fetched and added to the Leg 
        try {
            const result1 = await currentLeg.startingWaypoint.fetchWeatherForWaypoint();
            const result2 = await currentLeg.endingWaypoint.fetchWeatherForWaypoint();
            if (!result1.success || !result2.success) {
                //Operation failed
                return { success: false, error: "Could not fetch weather for waypoints" };
            }
        } catch (error) {
            return { success: false, error: error };
        }

        //Weather is in Waypoint
        currentLeg.calcRelativeDirectionAndSpeed();

        currentLeg.calcTime();
        return { success: true, currentLeg: currentLeg };
    }

    calcTrueDistanceAndDirection() {
        //Point should contain lon and lat
        const currentPoint = {
            latitude: this.startingWaypoint.latitude,
            longitude: this.startingWaypoint.longitude,
        };
        const nextPoint = {
            latitude: this.endingWaypoint.latitude,
            longitude: this.endingWaypoint.longitude,
        };
        const distance = getDistance(currentPoint, nextPoint) / 1000 / 1.852;
        //return point in meter, convert in to knot

        const direction = getGreatCircleBearing(currentPoint, nextPoint);

        //Update the information for waypoint
        this.distance = distance;
        this.direction = direction;
        //Direction and distance is added to the Leg
    }

    calcRelativeDirectionAndSpeed() {
        //To be added vector addition to calc average wind
        const windSpeed = this.startingWaypoint.weather.windSpeed;
        const windDirection = this.startingWaypoint.weather.direction * (Math.PI / 180); //Converting to radians

        const finalDirection = this.direction * (Math.PI / 180);
        const aircraftSpeed = 120; //(cessna 172)

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

        this.relativeAircraftDir = relativeAircraftDirInDegrees;
        this.airspeed = trueAirspeed;
    }

    calcTime() {
        this.time = this.distance / this.airspeed;
    }

    normalizeLeg() {
        delete this.startingWaypoint;
        delete this.endingWaypoint;
        delete this.time;
        delete this.distance;
        delete this.airspeed;
        delete this.relativeAircraftDir;
        delete this.direction;
    }
}




module.exports = Leg;