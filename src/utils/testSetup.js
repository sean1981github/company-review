const { MongoMemoryServer } = require("mongodb-memory-server");

const setUpMongooseMemoryServer = async () => {
  const mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  process.env.MONGODB_URI = mongoUri;
  // Set reference to mongo server in order to close the server during teardown
  global.__MONGOSERVER__ = mongoServer;
};
module.exports = async () => {
  await setUpMongooseMemoryServer();
  process.env.JWT_SECRET_KEY = "mock secret key";
};
