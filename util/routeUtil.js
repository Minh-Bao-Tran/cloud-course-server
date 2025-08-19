const createHttpError = require("http-errors");
const mongodb = require("mongodb");

const Aircraft = require("@model/aircraft.model.js");
const Leg = require("@model/leg.model.js");
const Route = require("@model/route.model.js");

const validateUtil = require("@util/validateUtil.js");

async function createRoute(routeData, authData, pastRoute = false) {

    const validation = validateUtil.validateRouteData(routeData);

    if (validation.valid === false) {
        //Data is not valid
        const message = {
            message: validation.message,
        };
        return { success: false, error: message };
    }

    let aircraftId;
    let userId;
    try {
        aircraftId = new mongodb.ObjectId(routeData.aircraftId);
        userId = new mongodb.ObjectId(authData.user._id);
        // console.log(aircraftId);
    } catch (error) {
        return { success: false, error: error };
    }

    let aircraft;
    try {
        aircraft = await Aircraft.fetchAircraftByAircraftId(userId, aircraftId);
    } catch (error) {
        return { success: false, error: error };
    }

    if (!aircraft) {
        //Aircraft doesn't exist
        return next(createHttpError(400, "Aircraft does not exist"));
    }

    //Checking Airport
    const arrivingAirportCode = routeData.arrivingAirport.toUpperCase();
    const departingAirportCode = routeData.departingAirport.toUpperCase();

    let arrivingAirport;
    let departingAirport;
    try {
        arrivingAirport = await Route.fetchAirportByIATA(arrivingAirportCode);
        departingAirport = await Route.fetchAirportByIATA(departingAirportCode);
    } catch (error) {
        next(error);
    }
    if (!arrivingAirport || !departingAirport) {
        //Airport is not in 
        return { success: false, error: "Airport not in database" };
    }

    //Don't change anything from above
    const waypointIdList = routeData.waypoints.map((waypointId) => {
        return new mongodb.ObjectId(waypointId);
    });

    const allWaypointList = [departingAirport._id, ...waypointIdList, arrivingAirport._id];
    //Adding airport Id as a waypoint
    let legList;
    try {
        const aircraftSpeed = await Aircraft.fetchAircraftModelInfo(aircraft.aircraftType);
        const legListResult = await Leg.transformWaypointIntoLeg(allWaypointList, aircraftSpeed.cruiseSpeed);
        if (!legListResult.success) {
            return next(createHttpError(400, message));
        }
        legList = legListResult.legList;
    } catch (error) {
        return { success: false, error: error };
    }
    // console.log(legList);

    let route;
    if (!pastRoute) {
        //Route does not exist yet
        route = new Route(
            departingAirportCode,
            arrivingAirportCode,
            allWaypointList,
            legList,
            routeData.departingDate,
            routeData.arrivingDate,
            aircraftId,
            userId,
        );
    } else {
        const pastRouteId = new mongodb.ObjectId(pastRoute);
        route = new Route(
            departingAirportCode,
            arrivingAirportCode,
            allWaypointList,
            legList,
            routeData.departingDate,
            routeData.arrivingDate,
            aircraftId,
            userId,
            pastRouteId
        );

    }
    console.log(route);
    route.calcTotalTime();
    route.calcArrivingTime();
    route.calcTotalDistance();
    return { success: true, route: route };
}

module.exports = {
    createRoute: createRoute
};