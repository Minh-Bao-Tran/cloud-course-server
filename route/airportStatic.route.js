const express = require("express");

const db = require("../data/database.js");
const createHttpError = require("http-errors");

const router = express.Router();

//fetch all airport once just for the database
// Note:

router.get("/fetchAllAirports", async function (req, res, next) {
  let existingAirports;

  try {
    existingAirports = await db.getDb().collection("airportStatic").findOne({});
  } catch (error) {
    next(error);
  }

  if (existingAirports) {
    return next(createHttpError(400, "Data already existed"));
  }

  let response;
  try {
    response = await fetch(
      "https://flightradar24-com.p.rapidapi.com/v2/airports/list",
      {
        method: "GET",
        headers: {
          "x-rapidapi-key":
            "39ea5bf926msh2cb3030103be360p1e5d89jsncc0c878e486e",
          "x-rapidapi-host": "flightradar24-com.p.rapidapi.com",
        },
      }
    );
  } catch (error) {
    next(error);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    next(createHttpError(500));
  }

  const allMajorAirports = data.rows.filter((airport) => {
    //Keep the airport if the airport size is > 200000 or it is in Australia
    if (airport.size > 200000 || airport.country === "Australia") {
      return true;
    }
    return false;
  });

  const result = await db
    .getDb()
    .collection("airportStatic")
    .insertMany(allMajorAirports);

  res.json(JSON.stringify({ result: result }));
});

module.exports = router;
