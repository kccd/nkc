const settings = require('../settings');
const apiFn = require('./apiFunction');
let db = require('../dataModels');
let fn = {};


fn.checkMobile = async (mobile, oldMobile) => {
  let mobileCodes = await db.UsersPersonalModel.find().or([{mobile: mobile},{mobile: oldMobile}]);
  return mobileCodes.length;
};
// 查询24小时之内发送的相同类型的短信验证码条数
fn.checkNumberOfSendMessage = async (mobile, type) => {
  let time = Date.now()-24*60*60*1000;
  let smsCodes = await db.SmsCodeModel.find({mobile: mobile, toc: {$gt: time}, type: type});
  return smsCodes.length;
};
fn.checkNumberOfSendEmail = async (email) => {
  let time = Date.now() - 24 * 60 * 60 * 1000;
  let emailOfDB = await db.EmailRegisterModel.find({email: email, toc: {$gt: time}});
  return emailOfDB.length;
};
fn.checkUsername = async (username) => {
  let usernameOfDB = await db.UserModel.find({usernameLowerCase: username.toLowerCase()});
  return usernameOfDB.length;
};

fn.checkEmail = async (email) => {
  let emailOfDB = await db.UsersPersonalModel.find({email: email});
  return emailOfDB.length;
};

fn.checkMobileCode = async (mobile, code) => {
  let time = Date.now() - settings.sendMessage.mobileCodeTime;  //验证码有效时间
  return await db.SmsCodeModel.findOne({mobile: mobile, code: code, toc: {$gt: time}});
};
fn.checkEmailCode = async (email, code) => {
  let time = Date.now() - settings.sendMessage.emailCodeTime;   //邮件链接有效时间
  return await db.EmailRegisterModel.findOne({email: email, ecode: code, toc: {$gt: time}});
};

fn.useRegCode = async (regCode, uid) => {
  return await db.AnswerSheetModel.replaceOne({key: regCode}, {uid: uid});
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

fn.addCertToUser = async (uid, cert) => {
  await db.UserModel.updateOne({uid: uid},{$addToSet:{certs: cert}});
};

fn.checkRigsterCode = async (regCode) => {
  let regCodeOfDB = await db.AnswerSheetModel.findOne({key: regCode});
  if(!regCodeOfDB) throw '验证注册码失败，请检查！';
  if (regCodeOfDB.uid) throw '答卷的注册码过期，可能要重新参加考试';
  if (Date.now() - regCodeOfDB.tsm > settings.exam.timeBeforeRegister) throw '答卷的注册码过期，可能要重新参加考试';
  return regCodeOfDB;
};

fn.createUser = async (data) => {
  let userObj = Object.assign({}, data);
  let userCount = 73327;//await db.SettingModel.operateSystemID('users', 1);
  let time = Date.now();
  userObj.toc = time;
  userObj.tlv = time;
  userObj.uid = parseInt(userCount);
  userObj.certs = [];
  if(userObj.mobile) userObj.certs = ['mobile'];
  if(userObj.email) userObj.certs = ['email'];
  if(!userObj.isA) {
    userObj.certs.push('examinated');
  }
  if(typeof(userObj.password) === 'string') {
    let salt = Math.floor((Math.random() * 65536)).toString(16);
    let hash = apiFn.sha256HMAC(userObj.password, salt);
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
  userObj.descriptionOfForum = userObj.username + '的专栏';
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