const mongoose = require("../settings/database");
const schema = new mongoose.Schema({
  type: {
    type: String, // normal: 常规的，可在全局和专业中设置, special: 特殊的，只能全局设置
    required: true,
    index: 1,
  },
  data: {
    type: [
      {
        _id: String,

      }
    ]
  }
}, {
  collection: 'schema'
});

module.exports = schema;
