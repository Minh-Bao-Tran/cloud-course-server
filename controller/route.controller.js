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

  if (!validateUtil.validateRouteData(routeData)) {
    return next(createHttpError(400, "Route data is not valid"));
  }

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

  //Create the route object
  const routeId = new mongodb.ObjectId();
  const route = new Route(
    routeData.departingAirport,
    routeData.arrivingAirport,
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

  // console.log(route);
  route.calculateDistance();
}

module.exports = {
  addNewRoute: addNewRoute,
};
