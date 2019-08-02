const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  uid: {
    type: String,
    default: "",
    index: 1
  },
  columnId: {
    type: Number,
    default: null,
    index: 1
  },
  imgType: {
    type: String,
    required: true,
    index: 1
  },
  imgId: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  type: {// "userChangeAvatar"
    type: String,
    required: true,
    index: 1
  }
}, {
  collection: "imageLogs"
});
module.exports = mongoose.model("imageLogs", schema);