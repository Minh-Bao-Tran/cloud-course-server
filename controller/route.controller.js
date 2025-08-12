const createHttpError = require("http-errors");
const mongodb = require("mongodb");

const Aircraft = require("@model/aircraft.model.js");
const User = require("@model/user.model.js");
const Route = require("@model/route.model.js");

const validateUtil = require("@util/validateUtil.js");

async function addNewRoute(req, res, next) {
  if (!req.auth) {
    next(createHttpError(500, "Internal Error"));
  }
  const routeData = req.body;

  const validation = validateUtil.validateRouteData(req.body);
  if (validation.valid === false) {
    //Data is not valid
    const message = {
      message: validation.message,
    };
    const err = createHttpError(400, message);
    return next(err);
  }

  //Checking Aircraft
  let aircraftId;
  let userId;

  try {
    aircraftId = new mongodb.ObjectId(req.body.aircraftId);
    userId = new mongodb.ObjectId(req.auth.user._id);
  } catch (error) {
    return next(error);
  }

  let aircraft;
  try {
    aircraft = await Aircraft.fetchAircraftByAircraftId(userId, aircraftId);
  } catch (error) {
    return next(error);
  }

  if (!aircraft) {
    //Aircraft doesn't exist
    return next(400, "Aircraft does not exist");
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
    //Airport is not in database
    return next(createHttpError(400, "Airport is not in database"));
  }

  //Create the route object
  const routeId = new mongodb.ObjectId();
  const route = new Route(
    departingAirportCode,
    arrivingAirportCode,
    routeData.waypoints,
    routeData.departingDate,
    routeData.arrivingDate,
    aircraftId,
    userId,
    routeId
  );

  try {
    await route.addAirportToWaypoints();
  } catch (error) {
    next(error);
  }
  route.calcAllDistanceAndDirection();
  console.log(route);
}

module.exports = {
  addNewRoute: addNewRoute,
};
