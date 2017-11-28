const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const logSchema = new Schema({
  error: Object,
  method: {
    type: String,
    required: true,
    index: 1
  },
  path: {
    type: String,
    required: true,
    index: 1
  },
  query: Object,
  status: {
    type: Number,
    required: true,
    index: 1
  },
  ip: {
    type: String,
    required: true,
    index: 1
  },
  port: {
    type: String,
    required: true,
    index: 1
  },
  reqTime: Date,
  processTime: Number,
  uid: {
    type: String,
    index: 1,
    required: true
  }
});

module.exports = mongoose.model('logs', logSchema);
