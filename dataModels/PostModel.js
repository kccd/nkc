const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

const postSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true
  },
  atUsers: {
    type: [String],
    default: []
  },
  c: {
    type: String,
    default: ''
  },
  credits: {
    type: [String],
    default: []
  },
  disabled: {
    type: Boolean,
    default: false,
    index: 1
  },
  ipoc: {
    type: String,
    default: '0.0.0.0'
  },
  iplm: {
    type: String,
  },
  l: {
    type: String,
    required: true
  },
  r: {
    type: [String],
    default: []
  },
  recUsers: {
    type: [String],
    default: []
  },
  rpid: {
    type: [String],
    default: ''
  },
  t: {
    type: String,
    default: ''
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  toc: {
    type: Number,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Number,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  uidlm: {
    type: String
  },
  username: {
    type: String,
    default: ''
  }
});

postSchema.pre('save' , function(next) {
  if(!this.iplm) {
    this.iplm = this.ipoc;
  }
  if(!this.tlm) {
    this.tlm = this.toc;
  }
  if(!this.uidlm) {
    this.uidlm = this.uid;
  }
  next();
});

module.exports = mongoose.model('posts', postSchema);