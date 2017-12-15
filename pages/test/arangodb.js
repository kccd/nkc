db = require('arangojs')('http://127.0.0.1:8529');
db.useDatabase('rescue');
module.exports = db;