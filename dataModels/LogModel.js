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
    required: true,
  },
  query: Schema.Types.Mixed,
  status: {
    type: Number,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  port: {
    type: String,
    required: true,
  },
  reqTime: Date,
  processTime: Number,
  uid: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('logs', logSchema);
