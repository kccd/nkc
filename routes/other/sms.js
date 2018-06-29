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
    let replies = await db.ReplyModel.find({toUid: user.uid}).sort({toc: -1});
    const repliesLength = replies.length;
    const paging = apiFn.paging(page, repliesLength);
    const start = paging.start;
    replies = replies.slice(start, start + perpage);
    replies = await Promise.all(replies.map(async replie => {
      await replie.extendFromPost().then(p => p.extendUser());
      await replie.extendToPost().then(async p => {
        await p.extendUser();
        await p.extendThread().then(t => t.extendFirstPost());
      });
      return replie;
    }));
    data.docs = replies;
    data.paging = paging;
    data.tab = 'replies';
    ctx.template = 'interface_messages.pug';
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await userPersonal.increasePsnl('replies');
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
    await userPersonal.increasePsnl('at');
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
      const docsLength = docs.length;
      if(docsLength === 0) {
        fromUser = await db.UserModel.findOne({uid: targetUid});
        if(fromUser){
          fromUser.group = [];
          fromUser.group.push(smsList[i]);
          docs.push(fromUser);
        }
        continue;
      }
      for (let j = 0; j < docsLength; j++) {
        if(docs[j].uid === targetUid) {
          docs[j].group.push(smsList[i]);
          break;
        }
        if(j === docs.length - 1) {
          fromUser = await db.UserModel.findOne({uid: targetUid});
          if(fromUser){
            fromUser.group = [];
            fromUser.group.push(smsList[i]);
            docs.push(fromUser);
          }
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
    await userPersonal.increasePsnl('message', viewedFalseNumber*-1);
    await next();
  })
  .post('/message', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {username, content} = ctx.body;
    if(!username || !content) ctx.throw(400, '参数不完整。');
    const targetUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    if(!targetUser) ctx.throw(400, '该用户不存在，请检查用户名是否输入正确');
    if(targetUser.uid === user.uid) ctx.throw(400, '为什么要跟自己发送信息？');
    data.targetUser = targetUser;
    const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid: targetUser.uid});
    const newSms = new db.SmsModel({
      sid: await db.SettingModel.operateSystemID('sms', 1),
      s: user.uid,
      r: targetUser.uid,
      c: content,
      port: ctx.port,
      ip: ctx.address
    });
    try{
      await newSms.save();
      await targetUserPersonal.increasePsnl('message', 1);
    }catch (err) {
      await db.SettingModel.operateSystemID('sms', -1);
      ctx.throw(500, `发送信息出错: ${err}`);
    }
    await next();
  })
  .get('/system', async (ctx, next) => {
    const {data, db} = ctx;
    const page = ctx.query.page || 0;
    const {user} = data;
    // 根据uid取出删帖日志
    const delPostMessage = await db.DelPostLogModel.find({"delUserId":user.uid,"noticeType":true}).sort({toc: -1});
    // console.log(delPostMessage)
    // 检测并处理退修超时
    for(var i in delPostMessage){
      let thread = await db.ThreadModel.findOne({"tid":delPostMessage[i].threadId})
      let sysTimeStamp = new Date(delPostMessage[i].toc).getTime()
      let nowTimeStamp = new Date().getTime()
      let diffTimeStamp = parseInt(nowTimeStamp) - parseInt(sysTimeStamp)
      let hourTimeStamp = 3600000 * 72;
      let lastTimestamp = parseInt(new Date(delPostMessage[i].toc).getTime()) + hourTimeStamp;
      delPostMessage[i].lastTime = new Date(lastTimestamp)
      // 退修转删除三个必要条件
      // 1.未修改
      // 2.delType为退修
      // 3.超时
      if(delPostMessage[i].modifyType === false && delPostMessage[i].delType === "toDraft" && diffTimeStamp > hourTimeStamp){
        await thread.update({"recycleMark":false,fid:"recycle"})
      }
    }

    const digestLog = await db.UsersScoreLogModel.find({uid: user.uid, operationId: {$in: ['digestThread', 'digestPost']}, type: 'score'});
    const digestArr = [];
		await Promise.all(digestLog.map(async log => {
			if(log.operationId === 'digestThread') {
				await log.extendThread();
				if(log.thread) {
					await log.thread.extendFirstPost();
					digestArr.push(log);
				}
			} else {
				const thread = await db.ThreadModel.findOne({tid: log.tid});
				if(thread) {
					await log.extendPost();
					if(log.post) {
						const options = {
							pid: log.pid
						};
						if(!data.userOperationsId.includes('displayDisabledPosts')) {
							options.disabled = false;
						}
						const {page} = await thread.getStep(options);
						log.page = page;
						digestArr.push(log);
					}
				}
			}

		}));

    const systemMessage= await db.SmsModel.find({fromSystem: true}).sort({toc: -1});


    let systemMessages = systemMessage.concat(digestArr);
    systemMessages = systemMessages.concat(delPostMessage);

    // 排序
	  const arr = [];
	  const tocArr = [];
	  for(let i = 0; i < systemMessages.length; i++) {
	  	const m = systemMessages[i];
	  	const toc = m.toc;
	  	if(tocArr.length === 0) {
	  		tocArr.push(toc);
	  		arr.push(m);
		  } else {
	  		let s = false;
			  for(let j = 0; j < tocArr.length; j++) {
				  const toc_ = tocArr[j];
				  if(toc_ < toc) {
					  tocArr.splice(j, 0, toc);
					  arr.splice(j, 0, m);
					  s = true;
					  break;
				  }
			  }
			  if(!s) {
			  	tocArr.push(toc);
			  	arr.push(m);
			  }
		  }
	  }
    const paging = apiFn.paging(page, systemMessages.length);
    const start = paging.start;
    systemMessageArr = arr.slice(start, start + perpage);
    data.docs = systemMessageArr;
    data.paging = paging;
    data.tab = 'system';
    ctx.template = 'interface_messages.pug';
    const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    await userPersonal.increasePsnl('system');
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
      await userPersonal.increasePsnl('system', -1);
    }
    data.docs = systemMessage;
    data.tab = 'system';
    ctx.template = 'interface_messages.pug';
    await next();
  });

module.exports = smsRouter;