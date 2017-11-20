let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');

let emailRegiserSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now
  },
  ecode: {
    type: String,
    required: true,
    index: 1
  },
  email: {
    type: String,
    required: true,
    index: 1
  },
  username: {
    type: String,
    required: true
  },
  password:{
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    }
  },
  hashType: {
    type: String,
    required: true
  },
  isA: {
    type: Boolean,
    default: false
  },
  regCode: {
    type: String,
    required: true
  },
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  regPort: {
    type: String,
    default: '0'
  },
  used: {
    type: Boolean,
    default: false
  }
});

let EmailRegiser = mongoose.model('emailRegister', emailRegiserSchema, 'emailRegister');

let t1 = Date.now();
console.log('开始读取数据');
db.query(`
  for e in emailRegister
  filter e
  return e
`)
.then(cursor => cursor.all())
.then((res) => {
  console.log('开始加密明文密码');
  for (let i = 0; i < res.length; i++) {
    res[i]._id = undefined;
    if(res[i].passwd){
      var salt = Math.floor((Math.random() * 65536)).toString(16);
      var hash = sha256HMAC(res[i].passwd, salt);
      res[i].password = {
        salt: salt,
        hash: hash
      };
      res[i].hashtype = 'sha256HMAC';
    }
    res[i].hashType = res[i].hashtype;
    if(!res[i].regCode) {
      res[i].regCode = 'none';
    }
  }
  return res;
})
.then((res) => {
  console.log('开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let emailRegister = new EmailRegiser(data);
    emailRegister.save()
    .then(() => {
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

function sha256HMAC(password,salt){
  const crypto = require('crypto')
  var hmac = crypto.createHmac('sha256',salt)
  hmac.update(password)
  return hmac.digest('hex')
}