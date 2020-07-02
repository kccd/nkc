const mongoose = require('../settings/database');
const schema = mongoose.Schema({
  _id: Number,
  name: {
    type: String,
    required: true,
    index: 1,
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 1,
    index: 1
  }
}, {
  collection: 'forumCategories'
});

module.exports = mongoose.model('forumCategories', schema);
