/** Common config for bookstore. */


let DB_NAME;

if (process.env.NODE_ENV === "test") {
  DB_NAME = 'bookstore_test';
} else {
  DB_NAME = 'bookstore';
}


module.exports = { DB_NAME };