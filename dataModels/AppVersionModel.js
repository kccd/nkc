const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const appVersionSchema = new Schema({
  appPlatForm: {
    type: String,
    default: "android"
  },
  appVersion: {
    type: String,
    default: "0.0.1",
    index: 1
  },
  appDescription: {
    type: String
  },
  appSize: {
    type: String
  },
  hash:{
    type: String,
  },
  fileName:{
    type: String
  },
  hits: {
    type: Number,
    default: 0
  },
  lastest: {
    type: Boolean,
    default: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  }
});

module.exports = mongoose.model('appVersion', appVersionSchema, 'appVersion');