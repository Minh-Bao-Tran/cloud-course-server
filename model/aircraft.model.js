const db = require("../data/database.js");
const mongodb = require("mongodb");

class Aircraft {
  constructor(
    aircraftType, //String
    aircraftRegistration, //String, length == 6
    aircraftBuildDate, //String, to be converted into Date
    aircraftModel, //String
    userId = null, //ObjectId
    _id = null //ObjectId
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

  static async fetchAircraftByUserId(userId) {
    const result = await db
      .getDb()
      .collection("aircrafts")
      .find({ userId: userId })
      .toArray();
    console.log(result);
    return result;
  }

  static async fetchAircraftByAircraftId(userId, aircraftId) {
    const result = await db
      .getDb()
      .collection("aircrafts")
      .findOne({ _id: aircraftId, userId: userId });

    return result;
  }
}

module.exports = Aircraft;
