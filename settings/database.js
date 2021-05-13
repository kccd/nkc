const mongo = require('./mongo');
mongo()
  .then(() => {
    // console.log(`MongoDB connected`);
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
module.exports = require('mongoose');