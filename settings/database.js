const mongoose = require('mongoose');
const nkcModules = require('../nkcModules');
const logger = nkcModules.logger;

const mongoDB = require('./mongoDB');
const options = {
  promiseLibrary: Promise,
  useMongoClient: true
};

mongoose.Promise = Promise;
mongoose.connect(mongoDB, options)
  .then(() => {
    logger.log('database connected.')
  })
  .catch(e => {
    logger.error(e.stack)
  });

module.exports = mongoose;