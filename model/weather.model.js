const mongodb = require("mongodb");

const db = require("../data/database.js");

class Weather {
  constructor (
    windSpeed = 0, //Float, windspeed is in knot
    direction = 0, //Float, true bearing
    cloud = null,
    gust = null,
    visibility = null,
    message = null,
    _id = new mongodb.ObjectId()
  ) {
    this.windSpeed = windSpeed;
    this.direction = direction;
    this.cloud = cloud;
    this.gust = gust;
    this.visibility = visibility;
    this.message = message;
    this._id = _id;
    //   weather: {
    //     message: condition.text from API
    //     windSpeed: float, knot,
    //     direction: compass, bearing
    //     cloud: ;
    //     gust: knot
    //     visibility: in km
    //   }
  }

  async addWeather(collection = "weather") {
    const result = await db.getDb().collection(collection).insertOne(this);
    return result;
  }

  static async fetchWeather(position) {
    if (
      !position.hasOwnProperty("latitude") ||
      !position.hasOwnProperty("longitude")
    ) {
      return { valid: false, message: "lon or lat is missing" };
    }

    const { longitude, latitude } = position;
    const url = `https://weatherapi-com.p.rapidapi.com/current.json?q=${latitude},${longitude}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "39ea5bf926msh2cb3030103be360p1e5d89jsncc0c878e486e",
        "x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
      },
    };

    let response;
    let result;
    try {
      response = await fetch(url, options);
      if (response.status !== 200) {
        //Response, the position for response is not available
        //Create a null object with default value
        return {
          valid: true,
          message: "Responded, not valid",
          weather: new Weather(),
        };
      }
      result = JSON.parse(await response.text());
    } catch (error) {
      return { valid: false, message: "Could not be fetched" };
    }
    const windSpeed = result.current.wind_kph / 1.852; // Convert into knot
    const direction = result.current.wind_degree;
    const cloud = result.current.cloud;
    const gust = result.current.gust_kph / 1.852; // Convert into knot
    const visibility = result.current.vis_km;
    const message = result.current.condition.text;

    const weather = new Weather(
      windSpeed,
      direction,
      cloud,
      gust,
      visibility,
      message
    );
    return { valid: true, weather: weather };
  }
}

module.exports = Weather;
