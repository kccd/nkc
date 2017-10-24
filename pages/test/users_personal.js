let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = Promise;
let Schema = mongoose.Schema;

db = require('arangojs')({url: 'http://root:@192.168.11.3',databaseName: 'rescue'});

let users_personalSchema = new Schema({
  /*uid: {
    type: String,
    required: true,
    index: 1
  },
  email: {
    type: String,
    default: '',
    index: 1
  },
  mobile: {
    type: String,
    default:'',
    index: 1
  },
  hashType: {
    type: String,
    required: true
  },
  lastTry: {
    type: Number,
    default: 0
  },
  password: {
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    }
  },
  newMessage: {
    replies: {
      type: Number,
      default: 0
    },
    message: {
      type: Number,
      default: 0
    },
    system: {
      type: Number,
      default: 0
    },
    at: {
      type: Number,
      default: 0
    }
  },
  regCode: {
    type: String,
    default: ''
  },
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  tries: {
    type: Number,
    default: 0
  }*/
  uid: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    default: '',
    match: /.*@.*/
  },
  mobile: {
    type: String,
    default:'',
    index: 1
  },
  hashType: {
    type: String,
    required: true
  },
  lastTry: {
    type: Number,
    default: 0
  },
  password: {
    salt: {
      type: String,
      required: true
    },
    hash: {
      type: String,
      required: true
    }
  },
  newMessage: {
    replies: {
      type: Number,
      default: 0
    },
    message: {
      type: Number,
      default: 0
    },
    system: {
      type: Number,
      default: 0
    },
    at: {
      type: Number,
      default: 0
    }
  },
  regCode: {
    type: String,
    default: ''
  },
  regIp: {
    type: String,
    default: ''
  },
  tries: {
    type: Number,
    default: 0
  }
});

let UsersPersonal = mongoose.model('usersPersonal', users_personalSchema, 'usersPersonal');

let t1 = Date.now();
console.log('开始读取数据');
db.query(`
  for u in users_personal
  return u
`)
.then(cursor => cursor.all())
.then((res) => {
  for(var i = 0; i < res.length; i++){
    if(!res[i].password.hasOwnProperty('hash')){
      var salt = Math.floor((Math.random() * 65536)).toString(16);
      var hash = sha256HMAC(res[i].password, salt);
      res[i].password = {
        salt: salt,
        hash: hash
      };
      res[i].hashType = 'sha256HMAC';  
    }
    if(res[i].password.hash == '' || res[i].password.salt == ''){
      let pw = '0123456789a';
      var salt = Math.floor((Math.random() * 65536)).toString(16);
      var hash = sha256HMAC(pw, salt);
      res[i].password = {
        salt: salt,
        hash: hash
      };
      res[i].hashType = 'sha256HMAC';
    }
    if(res[i].new_message.replies == null){
      res[i].newMessage.replies = 0;
    }
    res[i]._id = undefined;
    res[i].uid = res[i]._key;
    res[i].regIP = res[i].regip;
    res[i].newMessage = res[i].new_message;
    res[i].lastTry = res[i].lasttry;
    res[i].regCode = res[i].regcode;
    if(res[i].hashtype) {
      res[i].hashType = res[i].hashtype;
    }
    if(res[i].email && res[i].email.indexOf('@') == -1) {
      res[i].email = undefined;
    }
  }
  console.log('开始写入数据');
  let n = 0;
  let toMongo = () => {

    let data = res[n];
    let usersPersonal = new UsersPersonal(data);
    console.log(n);
    usersPersonal.save()
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
  };
  toMongo();
}) 
.catch((err) => {
  console.log(err);
});

function sha256HMAC(password,salt){
  const crypto = require('crypto')
  var hmac = crypto.createHmac('sha256',salt)
  hmac.update(password)
  return hmac.digest('hex')
}