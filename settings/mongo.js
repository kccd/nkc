const mongoose = require('mongoose');
const uriFormat = require('mongodb-uri')
const mongodbConfig = require('../config/mongodb.json');
const {
  username,
  password,
  database,
  address,
  port,
  poolSize,
  keepAlive
} = mongodbConfig;
let account = '';
if(username && password) {
  account = `${username}:${password}@`;
}
const options = {
  promiseLibrary: Promise,
  autoIndex: true,
  poolSize,
  keepAlive,

  // 新属性
  useNewUrlParser: true,
  useUnifiedTopology: true
};


mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

function encodeMongoURI (urlString) {
  if (urlString) {
    let parsed = uriFormat.parse(urlString)
    urlString = uriFormat.format(parsed);
  }
  return urlString;
}

mongoose.Promise = Promise;


mongoose.plugin(function(schema) {
  //
  schema.statics.findOnly = async function(query) {
    // this method should be used when you need the query throws an error
    // instead of returning a [] or null when no document matching
    const err = new Error(`${JSON.stringify(query)} document not found`);
    err.status = 404;
    if(JSON.stringify(query) === '{}')
      throw new Error('param not specify');
    const docs = await this.find(query);
    if(docs.length !== 1)
      throw err;
    return docs[0]
  };

  schema.post('init', function(doc, next) {
    doc._initial_state_ = JSON.parse(JSON.stringify(doc._doc));
    // doc._doc is the pure data of a document,
    // deep copy it to the doc so that you can compare the difference
    // conviniently
    // return next()

    // mongoose 5.12.3
    // init hooks are now fully synchronous and do not receive next() as a parameter.
  });
  schema.post('save', function(doc, next) {
    // same as when initializing..
    // do something before saving it
    //                    **IMPORTANT**
    // this middleware will be executed **AFTER** the execution of
    // middlewares which is defined in each instance schema.
    // this is to make the _initial_state_ always refer to the current state
    // after all the middlewares's execution has done, but during the execution of
    // inner the middlewares, _initial_state_ always refer to the last state

    doc._initial_state_ = JSON.parse(JSON.stringify(doc._doc));
    return next()
  })
});

process.on('unhandledRejection', (e, promise) => {
  console.error('unhandledRejection:\n' + e.stack + '\n' + promise)
});

module.exports = () => {
  return new Promise((resolve, reject) => {
    mongoose.connect(encodeMongoURI(`mongodb://${account}${address}:${port}/${database}`), options)
      .then(() => {
        resolve(mongoose);
      })
      .catch(e => {
        reject(e)
      });
  });
};
