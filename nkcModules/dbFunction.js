const settings = require('../settings');
const apiFn = require('./apiFunction');
let db = require('../dataModels');
let fn = {};

fn.getCountOfModelByQuery = async (model, match) => {
  return model.count(match);
};

fn.setNumberOfDigestThread = async (fid, number) => {
  let forum = await db.ForumModel.findOnly({fid});
  let threadCount = forum.tCount;
  threadCount = {
    digest: threadCount.digest + number,
    normal: threadCount.normal - number
  };
  return await db.ForumModel.replaceOne({fid}, {$set: {tCount: threadCount}});
};

fn.decrementPsnl = async (uid, type, number) => {
  let userPersonal = await db.UsersPersonalModel.findOne({uid: uid});
  let {newMessage} = userPersonal;
  if(number || number === 0) {
    newMessage[type] += number;
  } else {
    newMessage[type] = 0;
  }
  return await db.UsersPersonalModel.replaceOne({uid: uid}, {$set: {newMessage: newMessage}});
};

fn.extendPostAndUserByPid = async (pid) =>{
  let post = await db.PostModel.findOnly({pid});
  post = post.toObject();
  if(post.uid) {
    post.user = await db.UserModel.findOnly({uid: post.uid});
  }
  return post;
};

fn.extendThreadPostAndUserByTid = async (tid) => {
  let thread = await db.ThreadModel.findOnly({tid});
  thread = thread.toObject();
  if(thread.oc) {
    thread.oc = await fn.extendPostAndUserByPid(thread.oc);
  }
  if(thread.lm) {
    thread.lm = await fn.extendPostAndUserByPid(thread.lm);
  }
  return thread;
};

// 查询目标用户的个人搜藏
fn.getCollectionByQuery = async (query) => {
  let collections = await db.CollectionModel.find(query).sort({toc: 1});
  collections = await Promise.all(collections.map(async c => {
    c = c.toObject();
    c.thread = await fn.extendThreadPostAndUserByTid(c.tid);
    return c;
  }));
  return collections;
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
  return await db.SmsCodeModel.findOne({mobile: mobile, code: code, toc: {$gt: time}});
};
fn.checkEmailCode = async (email, code) => {
  let time = Date.now() - settings.sendMessage.emailCodeTime;   //邮件链接有效时间
  return await db.EmailRegisterModel.findOne({email: email, ecode: code, toc: {$gt: time}});
};

fn.useRegCode = async (regCode, uid) => {
  return await db.AnswerSheetModel.replaceOne({key: regCode}, {$set: {uid: uid}});
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
  let userCount = await db.SettingModel.operateSystemID('users', 1);
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
    await db.SettingModel.operateSystemID('users', -1);
    throw `新建用户出错！err: ${err}`;
  }
  return userObj;
};

fn.getAvailableForums = async ctx => {
  const forums = await ctx.db.ForumModel.aggregate([
    {$match: {
      class: {$in: ctx.data.certificates.contentClasses}
    }},
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
  for (let i = 0; i < result.length; i++) {
    if(result[i].children.length === 0) {
      result.splice(i, 1);
    }
  }
  return result;
};

fn.updateThread = async (tid) => {
  let thread = await db.ThreadModel.findOnly({tid});
  let posts = await db.PostModel.find({tid}).sort({toc: -1});
  let count = posts.length;
  if(count === 0) return;
  let timeToNow = new Date();
  let time = new Date(`${timeToNow.getFullYear()}-${timeToNow.getMonth()+1}-${timeToNow.getDate()}`);
  let countToday = 0;
  let countRemain = 0;
  for (let i = 0; i < posts.length; i++) {
    if(posts[i].toc > time) countToday++;
    if(!posts[i].disabled) countRemain++;
  }
  let lastPost = posts[0];
  let firstPost = posts[posts.length-1];
  let updateObj = {
    hasImage: thread.hasImage,
    hasFile: thread.hasFile,
    tlm: lastPost.toc.getTime(),
    count: count,
    countRemain: countRemain,
    countToday: countToday,
    oc: firstPost.pid,
    lm: lastPost.pid,
    toc: firstPost.toc.getTime(),
    uid: firstPost.uid
  };
  if(firstPost.r) {
    let r = firstPost.r;
    let extArr = ['jpg', 'png', 'svg', 'jpeg'];
    let imageNum = 0;
    for (let i = 0; i < r.length; r++) {
      let rFromDB = await db.ResourceModel.findOne({rid: r[i]});
      if(extArr.indexOf(rFromDB.ext) !== -1) {
        imageNum++;
        updateObj.hasImage = true;
      }
    }
    if(r.length > imageNum) updateObj.hasFile = true;
  }
  return await db.ThreadModel.replaceOne({tid}, {
    $set: updateObj
  })
};

fn.deleteEqualValue = (arr) => {
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
    if(!newArr.includes(arr[i])) newArr.push(arr[i]);
  }
  return newArr;
};

fn.updatePost = async (pid) => {
  const targetPost = await db.PostModel.findOnly(pid);
  const content = post.c;
  let resourcesDeclared = content.match(/\{r=[0-9]{1,20}}/g);
  if(!resourcesDeclared) resourcesDeclared = [];
  for (let i = 0; i < resourcesDeclared; i++) {
    resourcesDeclared[i] = resourcesDeclared[i].replace(/\{r=([0-9]{1,20})}/,'$1');
  }
  resourcesDeclared = fn.deleteEqualValue(resourcesDeclared);
  await db.PostModel.replaceOne({pid}, {$set: {r: resourcesDeclared}});

};

fn.getToppedThreads = async (query) => {
  let threads = await db.ThreadModel.find(query);
  threads = await Promise.all(threads.map( t => t.extend()));
  return threads;
};

fn.getCountOfThreadByFid = async (fid) => {
  let forum = await db.ForumModel.findOnly({fid});
  let childFid = [];
  if(forum.type === 'category') {
    let fidArr = await db.ForumModel.find({parentId: fid}, {_id: 0, fid: 1});
    for (let i of fidArr) {
      childFid.push(i.fid);
    }
  } else {
    childFid.push(fid);
  }
  return await db.ThreadModel.count({fid: {$in: childFid}});
};

fn.findUserByPid = async (pid) => {
  const post = await db.PostModel.findOne({pid});
  if(post) return await db.UserModel.findOne({uid: post.uid});
};

fn.findUserByTid = async (tid) => {
  const thread = await db.ThreadModel.findOne({tid});
  if(thread) return await db.UserModel.findOne({uid: thread.uid});
};

fn.findUserByQid = async (qid) => {
  const question = await db.QuestionModel.findOnly({qid});
  if(question) return await db.UserModel.findOne({uid: question.uid});
};

module.exports = fn;