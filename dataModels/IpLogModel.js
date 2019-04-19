const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const ipLogSchema = new Schema({
  ip:{
    type: String,
    default: ""
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
});

const IpLogModel = mongoose.model('ipLog', ipLogSchema);
module.exports = IpLogModel;

