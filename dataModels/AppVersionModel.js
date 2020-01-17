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
    required: true,
    index: 1
  },
  appDescription: {
    type: String,
    default: ""
  },
  appSize: {
    type: Number,
    default: 0
  },
  hash:{
    type: String,
    required: true,
    index: 1
  },
  fileName:{
    type: String,
    default: ""
  },
  hits: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  stable: {
    type: Boolean,
    default: false,
    index: 1
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  }
});
module.exports = mongoose.model('appVersion', appVersionSchema, 'appVersion');