let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://127.0.0.1:8529');
db.useDatabase('rescue');

let postsSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true,
    index: 1
  },
  fid: {
    type: String,
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
})

let Posts = mongoose.model('posts', postsSchema);


let t1 = Date.now();
console.log('将已删除用户的post转移到uid: 74365');
db.query(`
  for p in posts
  filter !document(users, p.uid)
  update p with{uid: '74365'} in posts
`)
  .then(() => {
  console.log('添加fid字段');
    return db.query(`
      for p in posts
      let thread = document(threads, p.tid)
      filter thread
      update p with {fid: thread.fid} in posts
    `)
  })
  .then(() => {
    console.log('开始读取数据');
    return db.query(`
      for p in posts
      filter document(threads, p.tid)
      return p
  `)
  })
.then(cursor => cursor.all())
.then((res) => {
  console.log('处理数据');
  for(let i = 0; i < res.length; i++){
    res[i]._id = undefined;
    res[i].pid = res[i]._key;
    res[i].c = res[i].c.toString();
    if(res[i].rpid) {
      res[i].rpid = res[i].rpid[0];
    }
    if(!res[i].credits || res[i].credits === null || res[i].credits === 'null'){
      res[i].credits = [];
    }
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let post = new Posts(data);
    post.save()
    .then(() => {
      if(m+1000 == n){
        m = n;
        console.log(n);
      }
      n++;
      if(n >= res.length) {
        let t2 = Date.now();
        console.log(`${res.length}条数据写入完成，耗时：${t2-t1}ms`);
        return;
      }else{
        toMongo();
        return;
      }
    })
    .catch((err) => {
      console.log(data);
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
}) 
.catch((err) => {
  console.log(err);
})
