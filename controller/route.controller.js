const createHttpError = require("http-errors");
const mongodb = require("mongodb");

const Aircraft = require("@model/aircraft.model.js");
const Leg = require("@model/leg.model.js");
const Route = require("@model/route.model.js");

const validateUtil = require("@util/validateUtil.js");

async function addNewRoute(req, res, next) {
  if (!req.auth) {
    return next(createHttpError(500, "Internal Error, auth "));
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
    return next(createHttpError(400, "Airport is not in database"));
  }

  //Don't change anything from above
  const waypointIdList = routeData.waypoints.map((waypointId) => {
    return new mongodb.ObjectId(waypointId);
  });

  const allWaypointList = [departingAirport._id, ...waypointIdList, arrivingAirport._id];
  //Adding airport Id as a waypoint
  const legList = await Leg.transformWaypointIntoLeg(allWaypointList);
  console.log(legList);


  // Create the route object
  const route = new Route(
    departingAirportCode,
    arrivingAirportCode,
    legList,
    routeData.departingDate,
    routeData.arrivingDate,
    aircraftId,
    userId,
  );

  route.calcTotalTime();
  route.calcArrivingTime();
  route.calcTotalDistance();


  route.normalizeLegs();
  let result;
  try {
    result = await route.addRoutes();
  } catch (error) {
    return next(error);
  }

  res.json(JSON.stringify({ success: result.acknowledged }));
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

  if (!fetchedRoute) {
    // aircraft doesn't exist
    return next(
      createHttpError(
        400,
        "Route does not exist or Route does not belong to user"
      )
    );
  }

  res.json(JSON.stringify(fetchedRoute));

}

async function updateRoute() {
  if (!req.auth) {
    next(createHttpError(500, "Internal Error"));
  }
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
  updateRoute: updateRoute
};
