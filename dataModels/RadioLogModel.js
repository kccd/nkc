const mongoose = require('../settings/database');

const radioLogSchema = new mongoose.Schema(
  {
    toc: {
      type: Date,
      required: true,
      index: 1,
    },
    uid: {
      type: String,
      default: '',
      index: 1,
    },
    ip: {
      type: String,
      default: '',
      index: 1,
    },
    port: {
      type: Number,
      default: 0,
    },

    // 站点ID radioSettings.stations
    stationId: {
      type: String,
      required: true,
    },
  },
  {
    collection: 'radioLogs',
  },
);

module.exports = mongoose.model('radioLog', radioLogSchema);
