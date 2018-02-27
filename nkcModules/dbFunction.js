const settings = require('../settings');
const apiFn = require('./apiFunction');
const db = require('../dataModels');
const fn = {};

fn.getQuestionsByQuery = async (query) => {
  const questions =  await db.QuestionModel.find(query).sort({toc: -1});
  await Promise.all(questions.map(q => q.extendUser()));
  return questions;
};

fn.questionCountOfCategory = async () => {
  return await db.QuestionModel.aggregate([
    {$group: {_id: '$category', number: {$sum: 1}}},
    {$sort: {number: -1}},
    {$project: {_id: 0, category: '$_id', number: 1}}
  ]);
};

fn.questionCountOfUser = async () => {
  return await db.QuestionModel.aggregate([
    {$group: {_id: '$uid', number: {$sum: 1}}},
    {$sort:{number: -1}},
    {$project: {_id: 0, user: '$_id', number: 1, }},
    {$lookup: {
      from: 'users',
      localField: 'user',
      foreignField: 'uid',
      as: 'user'
    }},
    {$unwind: '$user'}
  ]);
};



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
fn.checkNumberOfSendEmailReset = async (email) => {
  let time = Date.now() - 24 * 60 * 60 * 1000;
  let emailOfDB = await db.EmailCodeModel.find({email: email, toc: {$gt: time}});
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
  return await db.SmsCodeModel.findOne({mobile: mobile, code: code, toc: {$gt: time}, used: false});
};
fn.checkEmailCode = async (email, code) => {
  let time = Date.now() - settings.sendMessage.emailCodeTime;   //邮件链接有效时间
  return await db.EmailRegisterModel.findOne({email: email, ecode: code, toc: {$gt: time}, used: false});
};

fn.useRegCode = async (regCode, uid) => {
  return await db.AnswerSheetModel.replaceOne({key: regCode}, {$set: {uid: uid}});
};

fn.addCertToUser = async (uid, cert) => {
  await db.UserModel.updateOne({uid: uid},{$addToSet:{certs: cert}});
};

fn.checkRegisterCode = async (regCode) => {
  let regCodeOfDB = await db.AnswerSheetModel.findOne({key: regCode});
  if(!regCodeOfDB) throw '验证注册码失败，请检查！';
  if (regCodeOfDB.uid) throw '答卷的注册码过期，可能要重新参加考试';
  if (Date.now() - regCodeOfDB.tsm > settings.exam.timeBeforeRegister) throw '答卷的注册码过期，可能要重新参加考试';
  return regCodeOfDB;
};

fn.createUser = async (data) => {
  let userObj = Object.assign({}, data);
  let userCount = await db.SettingModel.operateSystemID('users', 1);
  let time = Date.now();
  userObj.toc = time;
  userObj.tlv = time;
  userObj.uid = userCount;
  userObj.certs = [];
  userObj.moderators = [userCount];
  if(userObj.mobile) userObj.certs = ['mobile'];
  if(userObj.email) userObj.certs = ['email'];
  if(!userObj.isA) {
    userObj.certs.push('examinated');
  }
  if(typeof(userObj.password) === 'string') {
    let passwordObj = apiFn.newPasswordObject(userObj.password);
    userObj.password = passwordObj.password;
    userObj.hashType = passwordObj.hashType;
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
  let usersSubscribe = new db.UsersSubscribeModel(userObj);
  try{
    await users.save();
    await usersPersonal.save();
    await personalForums.save();
    await usersSubscribe.save();
    const allSystemMessages = await db.SmsModel.find({fromSystem: true});
    for(let sms of allSystemMessages) {
    	const viewedUsers = sms.viewedUsers;
    	viewedUsers.push(userObj.uid);
	    await sms.update({viewedUsers});
    }
  }catch(err) {
    await db.UserModel.deleteMany({uid: userObj.uid});
    await db.UsersPersonalModel.deleteMany({uid: userObj.uid});
    await db.PersonalForumModel.deleteMany({uid: userObj.uid});
    await db.UsersSubscribeModel.deleteMany({uid: userObj.uid});
    await db.SettingModel.operateSystemID('users', -1);
    throw `新建用户出错！err: ${err}`;
  }
  return userObj;
};

fn.getAvailableForums = async ctx => {
  const forums = await ctx.db.ForumModel.aggregate([
    {$match: {
      $or: [{
        class: {$in: ctx.data.certificates.contentClasses},
        visibility: true
      },
        {
          isVisibleForNCC: true,
          visibility: true
        }]
    }},
    {$sort: {order: 1}},
    {$group: {
      _id: {parentId: '$parentId'},
      children: {$push: '$$ROOT'}
    }}
  ]);
  const forum = forums.filter(e => e._id.parentId === '')[0];
  const result = forum?forum.children: [];
  result.map(e => {
    e.children = [];
    for(const f of forums) {
      if(e.fid === f._id.parentId) {
        e.children = f.children
      }
    }
  });
  await Promise.all(result.map(async r => {
    return Promise.all(r.children.map(async f => {
      const {fid} = f;
      const {ThreadTypeModel} = db;
      f.threadTypes = await ThreadTypeModel.find({fid})
    }))
  }));
  return result;
};

fn.getForums = async ctx => {
  const forums = await ctx.db.ForumModel.aggregate([
    {$sort: {order: 1}},
    {$group: {
      _id: {parentId: '$parentId'},
      children: {$push: '$$ROOT'}
    }}
  ]);
  const result = forums.filter(e => e._id.parentId === '')[0].children;
  result.map(e => {
    e.children = [];
    for(const f of forums) {
      if(e.fid === f._id.parentId) {
        e.children = f.children
      }
    }
  });
  return result;
};

fn.getQuote = async function(c) {
  return c.match(/\[quote=(.*?),(.*?)]/);
};


module.exports = fn;