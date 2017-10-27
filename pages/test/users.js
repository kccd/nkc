let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')();
db.useDatabase('rescue');

let usersSchema = new Schema({
  uid: {
    type: String,
    required: true,
    index: 1
  },
  bday: {
    type: String,
    default: ''
  },
  cart: {
    type: Array,
    default: []
  },
  certs: {
    type: Array,
    default: []
  },
  color: {
    type: String,
    default: ''
  },
  postCount: {
    type: Number,
    default: 0
  },
  threadCount: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  digestThreadsCount: {
    type: Number,
    default: 0
  },
  disabledPostsCount: {
    type: Number,
    default: 0
  },
  disabledThreadsCount: {
    type: Number,
    default: 0
  },
  kcb: {
    type: Number,
    default: 0
  },
  lastVisitSelf: {
    type: Number,
    default: Date.now
  },
  postSign: {
    type: String,
    default: ''
  },
  recCount: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  tlv: {
    type: Number,
    default: Date.now,
    index: 1
  },
  toc: {
    type: Number,
    default: Date.now
  },
  toppedThreadsCount: {
    type: Number,
    default: 0
  },
  username: {
    type: String,
    required: true,
    index: 1
  },
  usernameLowerCase: {
    type: String,
    required: true,
    index: 1
  },
  xsf: {
    type: Number,
    default: 0
  }
});

let User = mongoose.model('users', usersSchema);



let t1 = Date.now();
console.log('开始读取数据');
db.query(`
  for u in users
  return u
`)
.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    if(res[i].score == null){
      res[i].score = 0;
    }
    res[i]._id = undefined;
    res[i].uid = res[i]._key;
    res[i].usernameLowerCase = res[i].username_lowercase;
    res[i].postSign = res[i].post_sign;
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let user = new User(data);
    user.save()
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
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
}) 
.catch((err) => {
  console.log(err);
})
