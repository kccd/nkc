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

mongoose.plugin(function(schema) {
  //
  schema.statics.findOnly = async function(query) {
    // this method should be used when you need the query throws an error
    // instead of returning a [] or null when no document matching
    if(JSON.stringify(query) === '{}')
      throw new Error('param not specify');
    const doc = await this.findOne(query);
    if(!doc)
      throw new Error(`${JSON.stringify(query)} document not found`);
    return doc
  };
  schema.post('init', function(doc, next) {
    doc._initial_state_ = JSON.parse(JSON.stringify(doc._doc));
    // doc._doc is the pure data of a document,
    // deep copy it to the doc so that you can compare the difference
    // conviniently
    return next()
  });
  schema.post('save', function(doc, next) {
    // same as when init
    // do something before saving it
    //                    **IMPORTANT**
    // this middleware will be executed **AFTER** the execution of
    // middlewares which is defined in each instance schema,
    // which makes the _initial_state_ always refer to the current state
    // after all the middlewares's execution has done, but during the execution of
    // inner the middlewares, _initial_state_ always refer to the last state

    doc._initial_state_ = JSON.parse(JSON.stringify(doc._doc));
    return next()
  })
});

process.on('unhandledRejection', (e, promise) => {
  console.error('unhandledRejection:\n' + e.stack + '\n' + promise)
});

module.exports = mongoose;