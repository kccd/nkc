db = require('arangojs')('http://192.168.11.111:8529');
db.useDatabase('rescue');
module.exports = db;