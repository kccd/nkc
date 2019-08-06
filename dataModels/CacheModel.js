const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema({
  key: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    required: true
  },
  type: { // visitorPage
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: "caches"
});
module.exports = mongoose.model("caches", schema);