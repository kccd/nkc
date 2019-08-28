const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;
const draftSchema = new Schema({
  c: {
    type: String,
    default: ''
  },
  l: {
    type: String,
    default: ''
  },
  t: {
    type: String,
    default: ''
  },
  destination: {
    type: {
      type: String,
      default: ''
    },
    typeid: {
      type: String,
      default: ''
    }
  },
  desType: {
    type: String,
    default: 'forum',
    index: 1
  },
  desTypeId: {
    type: String,
    default: '',
    index: 1
  },
  uid: {
    type: String,
    default: '',
    index: 1
  },
  did: {
    type: String,
    default: 0,
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  abstractCn: {
    type: String,
    default: "",
  },
  abstractEn: {
    type: String, 
    default: "",
  },
  authorInfos: {
    type: Array,
    default: []
  },
  keyWordsCn: {
    type: Array,
    default: []
  },
  keyWordsEn: {
    type: Array,
    default: []
  },
  originState: {
    type: String,
    default: "0"
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  mainForumsId: {
    type: [String],
    default: []
  },
  categoriesId: {
    type: [String],
    default: []
  }
});


module.exports = mongoose.model('draft', draftSchema);