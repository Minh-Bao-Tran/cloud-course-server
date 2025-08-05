const db = require("../data/database.js");
const mongodb = require("mongodb");

class User {
  constructor(
    userName,
    hashedPassword,
    email = null,
    mobile = null,
    _id = null
  ) {
    this._id = _id;
    this.userName = userName;
    this.hashedPassword = hashedPassword;
    this.email = email;
    this.mobile = mobile;
    // this.homeAirport = homeAirport;
    // this.commonlyVisitedAirport = commonlyVisitedAirport; //an array of ICAO code for airports
    // this.pilot = null; //in the form of a pilot object with fields: {pilotId, pilotRegistration, pilotTypeRating}
    // this.aircrafts = []; //in the form of an array with multiple aircrafts {aircraftId, aircraftType, aircraftRegistration}
    // this.routes = []; //in the form of an array with multiple routes
  }

  async signUpUser(collection = "users") {
    const result = await db.getDb().collection(collection).insertOne(this);
    return result;
  }
  async editUser() {}

  async fetchUserByID(_id) {}
  async fetchUserByUserName(userName) {}

  async fetchPilotDetails() {}
}

module.exports = User;
