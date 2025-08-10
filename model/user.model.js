const db = require("../data/database.js");
const mongodb = require("mongodb");

class User {
  constructor(
    userName, //String, No special character
    hashedPassword, //String
    email = null, //String, must contain @ and ,
    mobile = null, //String, length == 10
    _id = null //ObjectId
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

  static async fetchUserByID(_id) {
    //ID must already be in Object ID form
    const result = await db.getDb().collection("users").findOne({ _id: _id });
    return result;
  }

  static async fetchUserByUserName(userName) {
    const result = await db.getDb().collection("users").findOne({ userName: userName });
    return result;
  }

  static async fetchUserByEmail(email) {
    const result = await db.getDb().collection("users").findOne({ email: email });
    return result;
  }

  async fetchPilotDetails() {}
}

module.exports = User;
