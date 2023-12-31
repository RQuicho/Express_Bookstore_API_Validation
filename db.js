/** Database config for database. */


const { Client } = require("pg");
let { DB_NAME } = require("./config");

const db = new Client({
  host: "/var/run/postgresql/",
  database: DB_NAME
});

db.connect();


module.exports = db;
