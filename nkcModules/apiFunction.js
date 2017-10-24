const settings = require('../settings');
let db = require('../dataModels');
let fn = {};
fn.addCertToUser = async (uid, cert) => {
  await db.UserModel.updateOne({uid: uid},{$addToSet:{certs: cert}});
};
fn.forumList = async () => {
  let list = [];
  let parentForums = await db.ForumModel.find({parentId: ''}).sort({order: 1});
  for (let i = 0; i <  parentForums.length; i++) {
    list[i] = {};
    list[i].parentForum = parentForums[i];
    list[i].forumGroup = await db.ForumModel.find({parentId: parentForums[i].fid}).sort({order: 1});
  }
  return list;
};
fn.sha256HMAC = (password,salt) => {
  const crypto = require('crypto');
  let hmac = crypto.createHmac('sha256',salt);
  hmac.update(password);
  return hmac.digest('hex')
};
fn.testPassword = (input,hashtype,storedPassword) => {
  let pass = '';
  let hash = '';
  let salt = '';
  let hashed = '';
  switch (hashtype) {
    case 'pw9':
      pass = input
      hash = storedPassword.hash
      salt = storedPassword.salt

      hashed = md5(md5(pass)+salt)
      if(hashed!==hash){
        return false;
      }
      break;

    case 'sha256HMAC':
      pass = input
      hash = storedPassword.hash
      salt = storedPassword.salt

      hashed = fn.sha256HMAC(pass,salt)
      if(hashed!==hash){
        return false;
      }
      break;

    default:
      if(input !== storedPassword){ //fallback to plain
        return false;
      }
  }
  return true;
};
fn.newPasswordObject = (plain) => {
  let salt = Math.floor((Math.random()*65536)).toString(16)
  let hash = fn.sha256HMAC(plain,salt)
  return {
    hashtype:'sha256HMAC',
    password:{
      hash:hash,
      salt:salt,
    }
  };
};
fn.contentLength =  (content) => {
  const zhCN = content.match(/[^\x00-\xff]/g);
  const other = content.match(/[\x00-\xff]/g);
  const length1 = zhCN? zhCN.length * 2 : 0;
  const length2 = other? other.length : 0;
  return length1 + length2
};

fn.random = (n) => {
  let Num = "";
  for(let i = 0; i < n; i++) {
    Num += Math.floor(Math.random()*10);
  }
  return Num;
};

fn.checkRigsterCode = async (regCode) => {
  let regCodeOfDB = await db.AnswerSheetModel.findOne({key: regCode});
  if(!regCodeOfDB) throw '验证注册码失败，请检查！';
  if (regCodeOfDB.uid) throw '答卷的注册码过期，可能要重新参加考试';
  if (Date.now() - regCodeOfDB.tsm > settings.exam.timeBeforeRegister) throw '答卷的注册码过期，可能要重新参加考试';
  return regCodeOfDB;
};
fn.createUser = async (data) => {
  let userObj = Object.assign({}, data)._doc;
  let userCount = await db.CounterModel.findOneAndUpdate({type: 'users'},{$inc: {count: 1}});
  let time = Date.now();
  userObj.toc = time;
  userObj.tlv = time;
  userObj.uid = parseInt(userCount.count+1);
  userObj.certs = [];
  if(userObj.mobile) userObj.certs = ['mobile'];
  if(userObj.email) userObj.certs = ['email'];
  if(!userObj.isA) {
    userObj.certs.push('examinated');
  }
  if(typeof(userObj.password) === 'string') {
    let salt = Math.floor((Math.random() * 65536)).toString(16);
    let hash = fn.sha256HMAC(userObj.password, salt);
    userObj.password = {
      salt: salt,
      hash: hash
    };
    userObj.hashType = 'sha256HMAC';
  }
  userObj.newMessage = {
    messages: 0,
    at: 0,
    replies: 0,
    system: 0
  };
  userObj.abbr = userObj.username.slice(0, 6);
  userObj.displayName = userObj.username + '的专栏';
  userObj.description = userObj.username + '的专栏';
  let users = new db.UserModel(userObj);
  let usersPersonal = new db.UsersPersonalModel(userObj);
  let personalForums = new db.PersonalForumModel(userObj);
  let usersSubscribe = new db.UserSubscribeModel(userObj);
  try{
    await users.save();
    await usersPersonal.save();
    await personalForums.save();
    await usersSubscribe.save();
  }catch(err) {
    await db.UserModel.deleteMany({uid: userObj.uid});
    await db.UsersPersonalModel.deleteMany({uid: userObj.uid});
    await db.PersonalForumModel.deleteMany({uid: userObj.uid});
    await db.UserSubscribeModel.deleteMany({uid: userObj.uid});
    await db.CounterModel.replaceOne({type: 'users'},{$inc: {count: -1}});
    throw `新建用户出错！err: ${err}`;
  }
  return userObj;
};
module.exports = fn;