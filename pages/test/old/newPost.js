const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

db = require('arangojs')('http://127.0.0.1:8529');
db.useDatabase('rescue');

let postsSchema = new Schema({
  pid: {
    type: String,
    unique: true,
    required: true
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
    default: [],
    index: 1
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
});
const t = Date.now();
let Posts = mongoose.model('posts', postsSchema);
const errData = [];
let total = 0;
const init = async () => {
  total = await db.query(`
    for p in posts 
    filter document(threads, p.tid)
    collect with count into length
    return length
  `);
  total = await total.all();
  console.log(`总数：${total}`);
  console.log('将已删除用户的post转移到uid: 74365');
  await db.query(`
    for p in posts
    filter !document(users, p.uid)
    update p with {uid: '74365'} in posts
  `);
  console.log('添加fid');
  await db.query(`
    for p in posts 
    let thread = document(threads, p.tid)
    filter thread
    update p with {fid: thread.fid} in posts
  `);
};
const moveData = async (begin, count) => {
  let t1 = Date.now();
  console.log(`开始读取数据（${begin} - ${begin + count}）`);
  let data = await db.query(`
    for p in posts
    filter document(threads, p.tid)
    limit ${begin}, ${count}
    return p
  `);
  data = await data.all();
  console.log('开始写入...');
  let n = 0;

  for (let d of data){
    n++;
    d._id = undefined;
    d.pid = d._key;
    d.c = d.c.toString();
    if(d.rpid) d.rpid = d.rpid[0];
    if(!d.credits || d.credits === null || d.credits === 'null') d.credits = [];
    const newPost = new Posts(d);
    try {
      await newPost.save();
      console.log(`总数：${total}, 第${begin+n}条数据写入成功！当前${count}条耗时：${Date.now() - t1}ms， 累计耗时：${Date.now() - t}ms`);
    }catch (e) {
      errData.push(d);
      console.log(`==================该条数据写入失败！====================`);
      console.log(d);
      console.log(`======================================================`);
    }
  }
};

(async () => {
  await init();
  const num = 10000;
  const countOfFor = Math.ceil(total/num);
  for (let i = 0; i < countOfFor; i++) {
    await moveData(num*i, num);
  }
  console.log('所有数据转移完成！');
  console.log('错误数据如下：');
  console.log(errData);
})();