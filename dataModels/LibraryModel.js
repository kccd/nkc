const settings = require('../settings');
const mongoose = settings.database;
const schema = new mongoose.Schema({
  _id: Number,
  description: {
    type: String,
    default: ""
  }
}, {
  collection: "libraries"
});

schema.statics.newLibrary = async (options = {}) => {
  options._id = await mongoose.model("settings").operateSystemID("libraries", 1);
  const library = mongoose.model("libraries")(options);
  await library.save();
  return library;
};

module.exports = mongoose.model("libraries", schema);

