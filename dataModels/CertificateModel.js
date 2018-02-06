const settings = require('../settings');
const {mongoose} = settings.database;
const {Schema} = mongoose;

const certificateSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  inheritFrom: {
    type: [String],
    default: []
  },
  selfModifyTimeLimit: {
    type:Number,
    required: true
  },
  elseModifyTimeLimit: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('certificates', certificateSchema);