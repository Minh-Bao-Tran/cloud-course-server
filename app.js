require("dotenv").config();

const express = require("express");

//Swagger
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

//shorthand naming scheme
const moduleAlias = require("module-alias/register");

//cookie
const cookieParser = require("cookie-parser");

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
const fetchAllAirportsRoute = require("@route/airportStatic.route.js");

const app = express();

// Load YAML Swagger file and serve swagger
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.urlencoded({ extended: false })); // Help to parse the body if a request is of POST Method
app.use(express.json()); //Help to parse the request in JSON format
app.use(cookieParser()); //Help to parse the cookie

app.use("/static", fetchAllAirportsRoute); //Initialise the app, only use once

app.use("/auth", authRoutes);

app.use(authenticateMiddleware); // Any routes that requires authentication is behind this line

app.use("/aircrafts", aircraftRoutes);
app.use("/route", routeRoutes);

app.get("/testAuth", function (req, res) {
  console.log(req.userData);
  return res.send("success");
});

app.use(errorHandlingMiddleware); //Error handling middleware is always at the last position

db.connectToDatabase().then(function () {
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
  // db.getDb().collection("user").insertOne({ content: "test" });
});
