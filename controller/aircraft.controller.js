const createHttpError = require("http-errors");
const mongodb = require("mongodb");

const Aircraft = require("@model/aircraft.model.js");
const User = require("@model/user.model.js");

const validateUtil = require("@util/validateUtil.js");

async function addAircraft(req, res, next) {
  if (!req.auth) {
    next(createHttpError(500, "Internal Error"));
  }
  const aircraftData = req.body;

  //Check Aircraft Data
  const validation = validateUtil.validateAircraftData(req.body);
  if (validation.valid === false) {
    //Data is not valid
    const message = {
      message: validation.message,
    };
    const err = createHttpError(400, message);
    return next(err);
  }

  const userId = new mongodb.ObjectId(req.auth.user._id);

  let existingUser;
  try {
    existingUser = User.fetchUserByID(userId);
  } catch (error) {
    next(error);
  }
  if (!existingUser) {
    //User doesn't exist
    next(createHttpError(409, "User does not exist"));
  }

  //User Exist
  const aircraftId = new mongodb.ObjectId();
  const aircraft = new Aircraft(
    aircraftData.aircraftType,
    aircraftData.airaircraftRegistration,
    aircraftData.aircraftBuildDate,
    aircraftData.aircraftModel,
    userId,
    aircraftId
  );

  try {
    aircraft.addAircraft();
  } catch (error) {
    next(error);
  }

  return res.json(JSON.stringify({ success: true }));
}

module.exports = {
  addAircraft: addAircraft,
};
