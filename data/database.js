const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let database;

const uri = process.env.MONGO_URI;
async function connect() {
  const client = await MongoClient.connect(uri);

  database = client.db(process.env.MONGODB_DATABASE_NAME);
}

function getDb() {
  if (!database) {
    throw new Error("Database connection is null");
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
