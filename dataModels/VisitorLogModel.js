const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const logSchema = new Schema({
  error: Object,
  method: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true
  },
  query: Schema.Types.Mixed,
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
  operationId: {
    type: String,
    required: true,
    index: 1
  },
  reqTime: {
    type: Date,
    index: 1
  },
  processTime: Number,
  referer: {
    type: String,
    default: ""
  },
  userAgent: {
    type: String,
    default: ""
  }
}, {
  collection: "visitorLogs"
});

const LogModel = mongoose.model('visitorLogs', logSchema);
module.exports = LogModel;

