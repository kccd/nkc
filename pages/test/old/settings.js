let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.111');
db.useDatabase('rescue');

let settingsSchema = new Schema({
  uid: {
    type: String,
    unique: true,
    required: true
  },
  ads: {
    type: [String]
  },
  popPersonalForums: {
    type: [String]
  },
  counters: {
    resources: Number,
    users: Number,
    posts: Number,
    threadTypes: Number,
    threads: Number,
    questions:Number,
    collections: Number,
    sms: Number
  }
});

let Settings = mongoose.model('settings', settingsSchema);

let returnMax = (arr) => {
  let max = 0;
  for (let i in arr) {
    console.log(arr[i]);
    if(max < parseFloat(arr[i])) max = parseFloat(arr[i])
  }
  return max;
};

let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for s in settings
  return s
`)

.then(cursor => cursor.all())
.then((res) => {
  console.log(`计算最大值`);
  let t = Date.now();
  return db.query(`
    let rArr = (for r in resources
      return r._key)
    let uArr = (for u in users
      return u._key)
    let pArr = (for p in posts
      return p._key)
    let ttArr = (for t in threadtypes
      return t._key)
    let tArr = (for t in threads
      return t._key)
    let question = length(questions)
    let sms = length(sms)
    let collection = length(collections)
    return {
      rArr,
      uArr,
      pArr,
      ttArr,
      tArr,
      question,
      sms,
      collection
    }          
  `)
    .then(a => a.all())
    .then(arr => {
      arr = arr[0];
      res[0].counters = {};
      res[0].counters.resources = returnMax(arr.rArr);
      res[0].counters.users = returnMax(arr.uArr);
      res[0].counters.threads = returnMax(arr.tArr);
      res[0].counters.posts = returnMax(arr.pArr);
      res[0].counters.threadTypes = returnMax(arr.ttArr);
      res[0].counters.questions = arr.question;
      res[0].counters.sms = arr.sms;
      res[0].counters.collections = arr.collection;
      console.log(`计算完成: ${Date.now() - t}`);
      return res;
    })
})
.then(res => {
  for(let i = 0; i < res.length; i++){
    res[i].uid = res[i]._key;
    res[i]._id = undefined;
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let settings = new Settings(data);
    settings.save()
    .then(() => {
      if(m+1000 === n){
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
