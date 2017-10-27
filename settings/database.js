const mongoose = require('mongoose');

const mongoDB = require('./mongoDB');
const options = {
  promiseLibrary: Promise,
  useMongoClient: true
};

mongoose.Promise = Promise;
mongoose.connect(mongoDB, options)
  .then(() => {
    console.log('database connected.'.green)
  })
  .catch(e => {
    console.error(e.stack.red)
  });

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason + '\n' + promise)
});

module.exports = mongoose;