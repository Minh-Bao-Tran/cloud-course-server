const db = require("../data/database.js");
const mongodb = require("mongodb");

class Aircraft {
  constructor(
    aircraftType,
    aircraftRegistration,
    aircraftBuildDate,
    aircraftModel,
    userId = null,
    _id = null
  ) {
    this._id = _id;
    this.aircraftType = aircraftType;
    this.aircraftRegistration = aircraftRegistration;
    this.aircraftBuildDate = new Date(aircraftBuildDate);
    this.aircraftModel = aircraftModel;
    this.userId = userId;
  }
  async addAircraft(collection = "aircrafts") {
    const result = await db.getDb().collection(collection).insertOne(this);
    return result;
  }
}

module.exports = Aircraft;
