const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
let ContersSchema = new Schema({
  type: {
    type: String,
    required: true,
    index: 1
  },
  count: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('counters', ContersSchema);