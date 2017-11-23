let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.8');
db.useDatabase('rescue');

const userSchema = new Schema({
  kcb: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  xsf: {
    type: Number,
    default: 0
  },
  tlv: {
    type: Date,
    default: Date.now,
  },
  disabledPostsCount: {
    type: Number,
    default: 0
  },
  disabledThreadsCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  threadCount: {
    type: Number,
    default: 0
  },
  subs: {
    type: Number,
    default: 0
  },
  recCount: {
    type: Number,
    default: 0
  },
  toppedThreadsCount: {
    type: Number,
    default: 0
  },
  digestThreadsCount: {
    type: Number,
    default: 0,
  },
  score: {
    default: 0,
    type: Number
  },
  lastVisitSelf: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30,
    unique: true
  },
  usernameLowerCase: {
    type: String,
    unique: true
  },
  uid: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  bday: String,
  cart: [String],
  email: {
    type: String,
    match: /.*@.*/
  },
  description: String,
  color: String,
  certs: {
    type: [String],
    index: 1
  },
  introText: String,
  postSign: String,
});

let User = mongoose.model('users', userSchema);



let t1 = Date.now();
console.log(`删除错误账号： 74190 74191`);
db.query(`
  for u in users
    filter !document(users, u._key)
      remove u in users
`)
  .then(() => {
    console.log('开始读取数据');
    return db.query(`
      for u in users
      return u
    `)
  })
.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    if(res[i].score == null){
      res[i].score = 0;
    }
    res[i]._id = undefined;
    res[i].uid = res[i]._key;
    if(res[i].username.length >= 30) res[i].username = res[i].username.slice(0,30);
    res[i].usernameLowerCase = res[i].username.toLowerCase();
    res[i].postSign = res[i].post_sign;
    res[i].certs = res[i].certs || [];
    if(res[i].certs.indexOf('mail') !== -1) {
      res[i].certs.splice(res[i].certs.indexOf('mail'), 1, 'email');
    }
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
