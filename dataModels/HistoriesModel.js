const settings = require('../settings');
const mongoose = settings.database;
const Schema = mongoose.Schema;

let HistoriesSchema = new Schema({
  atUsers: {
    type: Array,
    default: []
  },
  t: {
    type: String,
    default: ''
  },
  c: {
    type: String,
    required: true
  },
  credits: {
    type: Array,
    default: []
  },
  disabled: {
    type: Boolean,
    default: false
  },
  ipoc: {
    type: String,
    default: '0.0.0.0'
  },
  iplm: {
    type: String,
  },
  r: {
    type: Array,
    default: []
  },
  tid: {
    type: String,
    required: true
  },
  tlm: {
    type: Date
  },
  toc: {
    type: Date,
    default: Date.now
  },
  uid: {
    type: String,
    required: true
  },
  uidlm: {
    type: String
  },
  l: {
    type: String,
    default: ''
  },
  pid: {
    type: String,
    required: true,
    index: 1
  },
  fid: {
    type: String,
    default: '',
    index: 1
  },
});

HistoriesSchema.pre('save', function(next) {
  if(!this.iplm){
    this.iplm = this.ipoc;
  }
  if(!this.uidlm){
    this.uidlm = this.uid;
  }
  if(!this.tlm) {
    this.tlm = this.toc
  }
  next();
});

module.exports = mongoose.model('histories', HistoriesSchema);