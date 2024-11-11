const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    protocolName: {
      type: String,
      default: '',
    },
    protocolTypeId: {
      type: String,
      index: 1,
      require: true,
    },
    protocolTypeName: {
      type: String,
      default: '',
    },
    protocolContent: {
      type: String,
      default: '',
    },
    l: {
      type: String,
      default: 'json',
    },
  },
  {
    collection: 'protocol',
  },
);

module.exports = mongoose.model('protocol', schema);
