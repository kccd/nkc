let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.111');
db.useDatabase('rescue');
let smsSchema = new Schema({
  sid: {
    type: Number,
    required: true
  },
  c: {
    type: String,
    default: ''
  },
  ip: {
    type: String,
    default: '0.0.0.0'
  },
  port: {
    type: String,
    default: '0'
  },
  r: {
    type: String,
    default: '',
    index: 1
  },
  s: {
    type: String,
    default: '',
    index: 1
  },
  toc: {
    type: Date,
    default: Date.now
  },
  viewed: {
    type: Boolean,
    default: false
  },
  fromSystem: {
    type: Boolean,
    default: false,
    index: 1
  },
  systemContent: {
    title: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    }
  },
  viewedUsers: {
    type: [String],
    default: []
  }
});

let Sms = mongoose.model('sms', smsSchema);


let t1 = Date.now();

console.log('开始读取数据');
return db.query(`
  for s in sms
  return s
`)

.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    res[i]._id = undefined;
    let sms = res[i];
    res[i].sid = i+1;
    if(sms.s === 'system' && typeof(sms.c) === 'object' && typeof(sms.viewed === 'array')) {
      console.log(sms);
      res[i].fromSystem = true;
      res[i].systemContent = sms.c;
      res[i].viewedUsers = sms.viewed;
      res[i].s = '';
      res[i].c = '';
      res[i].viewed = false;
      console.log(res[i]);
    }
  }
  console.log('开始写入数据');
  let n = 0;
  let m = 0;
  let toMongo = () => {
    let data = res[n];
    let sms = new Sms(data);
    sms.save()
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
