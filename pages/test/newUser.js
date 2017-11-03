let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')('http://192.168.11.15');
db.useDatabase('rescue');


let countersSchema = new Schema({
  type: {
    type: String,
    required: true,
    index: 1
  },
  count: {
    type: Number,
    required: true
  }
});

let Counter = mongoose.model('counters', countersSchema);

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
  disabledPostCount: {
    type: Number,
    default: 0
  },
  disabledThreadCount: {
    type: Number,
    default: 0
  },
  focus_forums: {
    type: String,
    default: ''
  },
  kcb: {
    type: Number,
    default: 0
  },
  lastVisitSelf: {
    type: Number,
    default: Date.now
  },
  post_sign: {
    type: String,
    default: ''
  },
  recCount: {
    type: Number,
    default: 0
  },
  regIP: {
    type: String,
    default: '0.0.0.0'
  },
  regPort: {
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
    index: 1,
    unique: true
  },
  username_lowercase: {
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
let users_personalSchema = new Schema({
  uid: {
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
    default: ''
  },
  lasttry: {
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
  new_message: {
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
  regcode: {
    type: String,
    default: ''
  },
  regip: {
    type: String,
    default: '0.0.0.0'
  },
  tries: {
    type: Number,
    default: 0
  }
});

let UsersPersonal = mongoose.model('usersPersonal', users_personalSchema, 'usersPersonal');
let personalForumsSchema = new Schema({
  uid: {
    type: String,
    required: true,
    index: 1
  },
  type: {
    type: String,
    default: 'forum'
  },
  abbr: {
    type: String,
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  moderators: {
    type: Array,
    default: []
  },
  recPosts: {
    type: Array,
    default: []
  },
  toppedThreads: {
    type: Array,
    default: []
  },
  announcement: {
    type: String,
    default: ''
  }
});

let PersonalForums = mongoose.model('personalForums', personalForumsSchema);


let userObj = {
  username: 'ZZZAAA4',
  password: '00000000q',
  hashType: '123',
  email: '133@qq.com',
  regPort: '8000',
  regIP: '192.168.11.10',
  isA: false
}
function newUser(userObj){
  let salt = Math.floor((Math.random() * 65536)).toString(16);
  let hash = sha256HMAC(userObj.password, salt);
  userObj.password = {
    salt: salt,
    hash: hash
  };
  userObj.abbr = userObj.username.substring(0, 6);
  userObj.displayName = userObj.username+'的专栏';
  userObj.description = userObj.username+'的专栏';
  userObj.username_lowercase = userObj.username.toLowerCase();
  userObj.certs = [];
  if(userObj.email){
    userObj.certs.push('mail');
  }
  if(userObj.mobile){
    userObj.certs.push('mobile');
  }
  if(!userObj.isA){
    userObj.certs.push('examinated');
  }
  Counter.findOneAndUpdate({type: 'users'}, {$inc:{count: 1}})
  .then((res) => {
    userObj.uid = res.count + 1;
    userObj.moderators = [userObj.uid];
    return new User(userObj).save();
  })
  .then(() => {
    return new UsersPersonal(userObj).save();
  })
  .then(() => {
    return new PersonalForums(userObj).save();
  })
  .then(() => {
    return User.find({uid: userObj.uid});
  })
  .then((res) => {
    console.log(res);
    return UsersPersonal.find({uid: userObj.uid});
  })
  .then((res) => {
    console.log(res);
    return PersonalForums.find({uid: userObj.uid});
  })
  .then((res) => {
    console.log(res);
  })
}
newUser(userObj);

function sha256HMAC(password,salt){
  const crypto = require('crypto')
  var hmac = crypto.createHmac('sha256',salt)
  hmac.update(password)
  return hmac.digest('hex')
}