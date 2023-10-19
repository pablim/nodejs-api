const { MongoClient } = require("mongodb")

const user = process.env.MONGO_DBUSER
const password = process.env.MONGO_DBPASSWORD
const host = process.env.MONGO_DBHOST
const port = process.env.MONGO_DBPORT
const database = process.env.MONGO_DATABASE

// Connection URL
const uri = `mongodb://${host}:${port}/`;

const client = new MongoClient(uri);

module.exports = {loyaltyConnection: client.db(database)}