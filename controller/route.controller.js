const createHttpError = require("http-errors");
const mongodb = require("mongodb");

const Aircraft = require("@model/aircraft.model.js");
const Leg = require("@model/leg.model.js");
const Route = require("@model/route.model.js");

const validateUtil = require("@util/validateUtil.js");
const routeUtil = require("@util/routeUtil.js");

//AddNewRoute and UpdateRoute could be refactored
async function addNewRoute(req, res, next) {
  if (!req.auth) {
    return next(createHttpError(500, "Internal Error, auth "));
  }
  const routeData = req.body;
  // const validation = validateUtil.validateRouteData(req.body);
  // if (validation.valid === false) {
  //   //Data is not valid
  //   const message = {
  //     message: validation.message,
  //   };
  //   const err = createHttpError(400, message);
  //   return next(err);
  // }

  // //Checking Aircraft
  // let aircraftId;
  // let userId;

  // try {
  //   aircraftId = new mongodb.ObjectId(req.body.aircraftId);
  //   userId = new mongodb.ObjectId(req.auth.user._id);
  // } catch (error) {
  //   return next(error);
  // }

  // let aircraft;
  // try {
  //   aircraft = await Aircraft.fetchAircraftByAircraftId(userId, aircraftId);
  // } catch (error) {
  //   return next(error);
  // }

  // if (!aircraft) {
  //   //Aircraft doesn't exist
  //   return next(createHttpError(400, "Aircraft does not exist"));
  // }

  // //Checking Airport
  // const arrivingAirportCode = routeData.arrivingAirport.toUpperCase();
  // const departingAirportCode = routeData.departingAirport.toUpperCase();

  // let arrivingAirport;
  // let departingAirport;
  // try {
  //   arrivingAirport = await Route.fetchAirportByIATA(arrivingAirportCode);
  //   departingAirport = await Route.fetchAirportByIATA(departingAirportCode);
  // } catch (error) {
  //   next(error);
  // }
  // if (!arrivingAirport || !departingAirport) {
  //   //Airport is not in 
  //   return next(createHttpError(400, "Airport is not in database"));
  // }

  // //Don't change anything from above
  // const waypointIdList = routeData.waypoints.map((waypointId) => {
  //   return new mongodb.ObjectId(waypointId);
  // });

  // const allWaypointList = [departingAirport._id, ...waypointIdList, arrivingAirport._id];
  // //Adding airport Id as a waypoint
  // let legList;
  // try {
  //   const legListResult = await Leg.transformWaypointIntoLeg(allWaypointList);
  //   if (!legListResult.success) {
  //     return next(createHttpError(400, message));
  //   }
  //   legList = legListResult.legList;
  // } catch (error) {
  //   return next(error);
  // }
  // console.log(legList);


  // // Create the route object
  // const route = new Route(
  //   departingAirportCode,
  //   arrivingAirportCode,
  //   legList,
  //   routeData.departingDate,
  //   routeData.arrivingDate,
  //   aircraftId,
  //   userId,
  // );

  // route.calcTotalTime();
  // route.calcArrivingTime();
  // route.calcTotalDistance();
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
  console.log(legList);

  if (!fetchedRoute) {
    // aircraft doesn't exist
    return next(
      createHttpError(
        400,
        "Route does not exist or Route does not belong to user"
      )
    );
  }

  const route = new Route(
    fetchedRoute.departingAirport,
    fetchedRoute.arrivingAirport,
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
  // const validation = validateUtil.validateRouteData(req.body);

  // if (validation.valid === false) {
  //   //Data is not valid
  //   const message = {
  //     message: validation.message,
  //   };
  //   const err = createHttpError(400, message);
  //   return next(err);
  // }

  // let aircraftId;
  // let userId;
  // try {
  //   aircraftId = new mongodb.ObjectId(req.body.aircraftId);
  //   userId = new mongodb.ObjectId(req.auth.user._id);
  // } catch (error) {
  //   return next(error);
  // }

  // let aircraft;
  // try {
  //   aircraft = await Aircraft.fetchAircraftByAircraftId(userId, aircraftId);
  // } catch (error) {
  //   return next(error);
  // }

  // if (!aircraft) {
  //   //Aircraft doesn't exist
  //   return next(createHttpError(400, "Aircraft does not exist"));
  // }

  // //Checking Airport
  // const arrivingAirportCode = routeData.arrivingAirport.toUpperCase();
  // const departingAirportCode = routeData.departingAirport.toUpperCase();

  // let arrivingAirport;
  // let departingAirport;
  // try {
  //   arrivingAirport = await Route.fetchAirportByIATA(arrivingAirportCode);
  //   departingAirport = await Route.fetchAirportByIATA(departingAirportCode);
  // } catch (error) {
  //   next(error);
  // }
  // if (!arrivingAirport || !departingAirport) {
  //   //Airport is not in 
  //   return next(createHttpError(400, "Airport is not in database"));
  // }

  // //Don't change anything from above
  // const waypointIdList = routeData.waypoints.map((waypointId) => {
  //   return new mongodb.ObjectId(waypointId);
  // });

  // const allWaypointList = [departingAirport._id, ...waypointIdList, arrivingAirport._id];
  // //Adding airport Id as a waypoint
  // let legList;
  // try {
  //   const legListResult = await Leg.transformWaypointIntoLeg(allWaypointList);
  //   if (!legListResult.success) {
  //     return next(createHttpError(400, message));
  //   }
  //   legList = legListResult.legList;
  // } catch (error) {
  //   return next(error);
  // }
  // console.log(legList);

  // const pastRouteId = new mongodb.ObjectId(req.params.routeId);

  // // Create the route object
  // const route = new Route(
  //   departingAirportCode,
  //   arrivingAirportCode,
  //   legList,
  //   routeData.departingDate,
  //   routeData.arrivingDate,
  //   aircraftId,
  //   userId,
  //   pastRouteId
  // );

  // route.calcTotalTime();
  // route.calcArrivingTime();
  // route.calcTotalDistance();

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
  console.log(legList);

  const pastRouteId = new mongodb.ObjectId(req.params.routeId);

  // Create the route object
  const route = new Route(
    departingAirportCode,
    arrivingAirportCode,
    legList,
    routeData.departingDate,
    routeData.arrivingDate,
    aircraftId,
    userId,
    pastRouteId
  );

  route.calcTotalTime();
  route.calcArrivingTime();
  route.calcTotalDistance();
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
