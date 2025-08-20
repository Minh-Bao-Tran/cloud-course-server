const createHttpError = require("http-errors");
const mongodb = require("mongodb");

const Leg = require("@model/leg.model.js");
const Route = require("@model/route.model.js");
const Aircraft = require("@model/aircraft.model.js");

const routeUtil = require("@util/routeUtil.js");

//AddNewRoute and UpdateRoute could be refactored
async function addNewRoute(req, res, next) {
  if (!req.auth) {
    return next(createHttpError(500, "Internal Error, auth "));
  }
  const routeData = req.body;
  const routeResult = await routeUtil.createRoute(routeData, req.auth);

  if (!routeResult.success) {
    return next(createHttpError(400, routeResult.message));
  }

  const route = routeResult.route;
  route.normalizeLegs();
  let result;
  try {
    result = await route.addRoutes();
  } catch (error) {
    return next(error);
  }

  res.json(JSON.stringify({ success: result.acknowledged, _id: result.insertedId }));
}

async function getOneRoute(req, res, next) {
  if (!req.auth) {
    next(createHttpError(500, "Internal Error"));
  }
  let userId;
  let routeId;
  try {
    userId = new mongodb.ObjectId(req.auth.user._id);
    routeId = new mongodb.ObjectId(req.params.routeId);
  } catch (error) {
    return next(createHttpError(400, "Id is not valid"));
  }

  const fetchedRoute = await Route.fetchRouteByRouteId(
    userId,
    routeId
  );

  let aircraftId;
  try {
    aircraftId = new mongodb.ObjectId(fetchedRoute.aircraftId);
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

  if (!fetchedRoute) {
    return next(createHttpError(400, "Route either does not exist or route does not belong to user"));
  }

  //Route exist
  const firstWaypointId = new mongodb.ObjectId(fetchedRoute.legs[0].startingWaypointId);
  let allWaypointList = [firstWaypointId];

  for (const leg of fetchedRoute.legs) {
    const nextWaypoint = new mongodb.ObjectId(leg.endingWaypointId);
    allWaypointList.push(nextWaypoint);
  }

  let legList;
  try {
    const legListResult = await Leg.transformWaypointIntoLeg(allWaypointList);
    if (!legListResult.success) {
      return next(createHttpError(400, message));
    }
    legList = legListResult.legList;
  } catch (error) {
    return next(error);
  }

  const route = new Route(
    fetchedRoute.departingAirport,
    fetchedRoute.arrivingAirport,
    fetchedRoute.waypoints,
    legList,
    fetchedRoute.departingDate,
    fetchedRoute.arrivingDate,
    fetchedRoute.aircraftId,
    fetchedRoute.userId,
    fetchedRoute._id,
    fetchedRoute.distance,
    fetchedRoute.time,
    fetchedRoute.active
  );

  res.json(JSON.stringify(route));

}

async function updateRoute(req, res, next) {
  if (!req.auth) {
    return next(createHttpError(500, "Internal Error, auth "));
  }
  const routeData = req.body;

  const routeResult = await routeUtil.createRoute(routeData, req.auth, req.params.routeId);


  if (!routeResult.success) {
    return next(createHttpError(400, routeResult.message));
  }

  const route = routeResult.route;
  route.normalizeLegs();
  let result;
  try {
    result = await route.updateRoutes();
  } catch (error) {
    return next(error);
  }

  res.json(JSON.stringify({ success: result.acknowledged }));

}

async function calcRoute(req, res, next) {
  if (!req.auth) {
    return next(createHttpError(500, "Internal Error, auth "));
  }
  const routeData = req.body;
  const routeResult = await routeUtil.createRoute(routeData, req.auth);

  if (!routeResult.success) {
    return next(createHttpError(400, routeResult.message));
  }

  const route = routeResult.route;

  res.json(JSON.stringify(route));
}

async function deleteOneRoute(req, res, next) {
  //Req.body is 
  if (!req.auth) {
    next(createHttpError(500, "Internal Error"));
  }
  let userId;
  let routeId;
  try {
    userId = new mongodb.ObjectId(req.auth.user._id);
    routeId = new mongodb.ObjectId(req.params.routeId);
  } catch (error) {
    return next(createHttpError(400, "Id is not valid"));
  }

  const result = await Route.deleteOneRoute(userId, routeId);

  res.json(JSON.stringify({ result: result }));
}

module.exports = {
  addNewRoute: addNewRoute,
  getOneRoute: getOneRoute,
  deleteOneRoute: deleteOneRoute,
  updateRoute: updateRoute,
  calcRoute: calcRoute
};
