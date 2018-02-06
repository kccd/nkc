const settings = require('../settings');
const {mongoose} = settings.database;
const {Schema} = mongoose;

const contentClassSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  value: {
    type: Boolean,
    required: true
  }
});

permissionSchema.pre('validate', function(next) {
  try {
    this._id = this._id.toLowerCase();
  } catch(e) {
    next(e)
  }
  next()
});

module.exports = mongoose.model('contentClasses', contentClassSchema);