let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

let postsSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true,
    index: 1
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
    type: [String],
    default: []
  },
  recUsers: {
    type: [String],
    default: []
  },
  rpid: {
    type: [String],
    default: []
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
    type: String,
    index: 1
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
});

let PostModel = mongoose.model('posts', postsSchema);
let t = 0;
(async function(){
  t = Date.now();
  const pidArr = await PostModel.find({}, {_id: 0, pid: 1});
  console.log(`加载所有pid: ${Date.now() - t}ms`);
  for (let p of pidArr) {
    const post = await PostModel.findOne({pid: p.pid});
    if(post.c && post.c.indexOf('[quote=') === 0) {
      console.log(post.c);
    }
  }
})();
