const Router = require('koa-router');
const smsRouter = new Router();
const nkcModules = require('../../nkcModules');
const settings = require('../../settings');
let {perpage} = settings.paging;
let dbFn = nkcModules.dbFunction;
let apiFn = nkcModules.apiFunction;

smsRouter
  .get(['/','/replies'], async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const page = ctx.query.page || 0;
    let replies = await db.RepliesModel.find({toUid: user.uid}).sort({toc: -1});
    const repliesLength = replies.length;
    const paging = apiFn.paging(page, repliesLength);
    const start = paging.start;
    replies = replies.slice(start, start + perpage);
    replies = await Promise.all(replies.map(async replie => {
      await replie.extendFromPost();
      await replie.extendToPost();
      return replie;
    }));
    data.docs = replies;
    data.paging = paging;
    data.tab = 'replies';
    ctx.template = 'interface_messages.pug';
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await userPersonal.decrementPsnl('replies');
    await next();
  })
  .get('/at', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const page = ctx.query.page || 0;
    let ats = await db.InviteModel.find({invitee: user.uid}).sort({toc: -1});
    let atsLength = ats.length;
    const paging = apiFn.paging(page, atsLength);
    const start = paging.start;
    ats = ats.slice(start, start + perpage);
    ats = await Promise.all(ats.map(async at => {
      await at.extendUser();
      await at.extendPost();
      return at;
    }));
    data.docs = ats;
    data.paging = paging;
    data.tab = 'at';
    ctx.template = 'interface_messages.pug';
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await userPersonal.decrementPsnl('at');
    await next();
  })
  .get('/message', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const page = ctx.query.page || 0;
    let smsList = await db.SmsModel.find().and([{fromSystem: false, },{$or: [{s: user.uid}, {r: user.uid}]}]).sort({toc: -1});
    let docs = [];
    for (let i = 0; i < smsList.length; i++) {
      let fromUser = {};
      let targetUid = '';
      if(smsList[i].r === user.uid) {
        targetUid = smsList[i].s;
      } else {
        targetUid = smsList[i].r;
      }
      if(docs.length === 0) {
        fromUser = (await db.UserModel.findOne({uid: targetUid})).toObject();
        fromUser.group = [];
        fromUser.group.push(smsList[i]);
        docs.push(fromUser);
        continue;
      }
      const docsLength = docs.length;
      for (let j = 0; j < docsLength; j++) {
        if(docs[j].uid === targetUid) {
          docs[j].group.push(smsList[i]);
          break;
        }
        if(j === docs.length - 1) {
          fromUser = (await db.UserModel.findOne({uid: targetUid})).toObject();
          fromUser.group = [];
          fromUser.group.push(smsList[i]);
          docs.push(fromUser);
        }
      }
    }
    const notViewed = [];
    for (let i = 0; i < docs.length; i++) {
      let groupLength = docs[i].group.length;
      for (let j = 0; j < groupLength; j++) {
        if(!docs[i].group[j].viewed && docs[i].group[j].r === user.uid) {
          let Obj = docs.splice(i,1);
          notViewed.unshift(Obj[0]);
          break;
        }
      }
    }
    for (let i in notViewed) {
      docs.unshift(notViewed[i])
    }
    const paging = await apiFn.paging(page, docs.length);
    const start = paging.start;
    docs = docs.slice(start, start + perpage);
    data.paging = paging;
    data.docs = docs;
    data.tab = 'message';
    ctx.template = 'interface_messages.pug';
    await next();
  })
  .get('/message/:uid', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {uid} = ctx.params;
    const page = ctx.query.page || 0;
    const targetUser = await db.UserModel.findOne({uid: uid});
    const messageOfUser = await db.SmsModel.find().and([{fromSystem: false, }, {$or: [{s: user.uid, r: targetUser.uid}, {s: targetUser.uid, r: user.uid}]}]).sort({toc: -1});
    const paging = apiFn.paging(page, messageOfUser.length);
    const start = paging.start;
    let messageArr = messageOfUser.slice(start, start + perpage);
    const findUserByUid = (uid) => {
      if(uid === user.uid) return user;
      if(uid === targetUser.uid) return targetUser;
      ctx.throw(500, '服务器查询聊天记录出错。');
    };
    let viewedFalseNumber = 0;
    messageArr = await Promise.all(messageArr.map(async (message, n) => {
      const targetMessage = message.toObject();
      targetMessage.s = findUserByUid(targetMessage.s);
      targetMessage.r = findUserByUid(targetMessage.r);
      // 该信息未读&&信息的接收者为自己，则将信息标记为已读且记录此次加载标记了多少条信息为已读(用于减少信息通知数)
      if(!message.viewed && message.r === user.uid) {
        viewedFalseNumber++;
        await message.update({viewed: true});
      }
      return targetMessage;
    }));
    data.paging = paging;
    data.docs = messageArr;
    data.targetUser = targetUser;
    data.tab = 'message';
    ctx.template = 'interface_messages.pug';
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await userPersonal.decrementPsnl('message', viewedFalseNumber*-1);
    await next();
  })
  .post('/message', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {username, content} = ctx.body;
    if(!username || !content) ctx.throw(400, '参数不完整。');
    const targetUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    if(!targetUser) ctx.throw(400, '该用户不存在，请检查用户名是否输入正确');
    data.targetUser = targetUser;
    const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});
    const newSms = new db.SmsModel({
      sid: await db.SettingModel.operateSystemID('sms', 1),
      s: user.uid,
      r: targetUser.uid,
      c: content,
      port: ctx.request.socket._peername.port,
      ip: ctx.request.socket._peername.address
    });
    try{
      await newSms.save();
      await targetUserPersonal.decrementPsnl('message', 1);
    }catch (err) {
      await db.SettingModel.operateSystemID('sms', -1);
      ctx.throw(500, `发送信息出错: ${err}`);
    }
    await next();
  })
  .get('/system', async (ctx, next) => {
    const {data, db} = ctx;
    const page = ctx.query.page || 0;
    const systemMessages = await db.SmsModel.find({fromSystem: true}).sort({toc: -1});
    const paging = apiFn.paging(page, systemMessages.length);
    const start = paging.start;
    systemMessageArr = systemMessages.slice(start, start + perpage);
    data.docs = systemMessageArr;
    data.paging = paging;
    data.tab = 'system';
    ctx.template = 'interface_messages.pug';
    await next();
  })
  .get('/system/:sid', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {sid} = ctx.params;
    const systemMessage = await db.SmsModel.findOnly({sid});
    await systemMessage.update({$addToSet: {viewedUsers: user.uid}});
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    // 若用户没有查看过该系统信息&&用户的系统通知数不为0 (防止出现出现负数的情况)，则让用户的newMessage.system - 1
    if(!systemMessage.viewedUsers.includes(user.uid) && userPersonal.newMessage.system > 0) {
      await userPersonal.decrementPsnl('system', -1);
    }
    data.docs = systemMessage;
    data.tab = 'system';
    ctx.template = 'interface_messages.pug';
    await next();
  });

module.exports = smsRouter;