require("dotenv").config();

const express = require("express");

const db = require("./data/database.js");

const app = express();

app.get("/", function (req, res) {
  res.send("Hello ");
});

db.connectToDatabase().then(function () {
  app.listen(3000, () => {
    console.log("listening on port 3000");
  });
    // db.getDb().collection("test").insertOne({ content: "test" });
});
