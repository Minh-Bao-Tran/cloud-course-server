require("dotenv").config();

const express = require("express");

//Swagger
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

//shorthand naming scheme
const moduleAlias = require("module-alias/register");

//cookie
const cookieParser = require("cookie-parser");
//Cross-Origin allowed
const cors = require("cors");

//database
const db = require("@data/database.js");

//middleware
const authenticateMiddleware = require("@middleware/authenticate.middleware.js");
const errorHandlingMiddleware = require("@middleware/error.middleware.js");

//routes
const authRoutes = require("@route/auth.route.js");
const aircraftRoutes = require("@route/aircraft.route.js");
const routeRoutes = require("@route/route.route.js");

//Use Once:
const staticRoutes = require("@route/static.route.js");

const app = express();

//Cross-Origined allowed
app.use(cors());
// Load YAML Swagger file and serve swagger
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.urlencoded({ extended: false })); // Help to parse the body if a request is of POST Method
app.use(express.json()); //Help to parse the request in JSON format
app.use(cookieParser()); //Help to parse the cookie

app.use("/static", staticRoutes); //Initialise the app, only use once

app.use("/auth", authRoutes);

app.use(authenticateMiddleware); // Any routes that requires authentication is behind this line

app.use("/aircrafts", aircraftRoutes);
app.use("/routes", routeRoutes);

const Weather = require("@model/weather.model.js");
app.get("/testAuth", async function (req, res) {
  console.log(req.auth);
  const weather = await Weather.fetchWeather({ lat: 53.1, lon: -0.13 });
  return res.json(JSON.stringify(weather));
});

app.use(errorHandlingMiddleware); //Error handling middleware is always at the last position

db.connectToDatabase().then(function () {
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
  // db.getDb().collection("user").insertOne({ content: "test" });
});
