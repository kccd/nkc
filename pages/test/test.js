let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');

let postsSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true
  },
  atUsers: {
    type: Array,
    default: []
  },
  c: {
    type: String,
    default: ''
  },
  credits: {
    type: Array,
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
    type: Array,
    default: []
  },
  recUsers: {
    type: Array,
    default: []
  },
  rpid: {
    type: String,
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
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  uidlm: {
    type: String
  }
});

postsSchema.pre('save' , function(next) {
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
})

let Posts = mongoose.model('posts', postsSchema);
(async function(){
  let data = await Posts.aggregate([
    {$match: {tid: '5828'}},
    {$project: {id: '$$ROOT'}},
    {$count: 'number'},
  ]);
  console.log(data);
  let t1 = Date.now();
  console.log(`count: ${await Posts.find({}, {_id: 1}).count()}`);
  console.log(Date.now() - t1);
  let t2 = Date.now();
  console.log(`count: ${await Posts.count()}`);
  console.log(Date.now() - t2);
})();