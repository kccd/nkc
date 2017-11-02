const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;
let apiFn = nkcModules.apiFunction;
const experimentalRouter = new Router();

let tlv = 0;
let buffer = [];

experimentalRouter
  .get('/', async (ctx, next) => {
    let forumList = await dbFn.getAvailableForums(ctx);
    ctx.data.forumList = forumList;
    ctx.data.forumTree = forumList;
    ctx.template = 'interface_experimental.pug';
    await next();
  })
  .get('/newUsers', async (ctx, next) => {
    let {db} = ctx;
    let {user} = ctx.data;
    let page = parseInt(ctx.query.page);
    if(!page || page === 0) {
      page = 0;
    }else {
      page--;
    }
    let userLength = await db.UserModel.count();
    let paging = apiFn.paging(page, userLength);
    /*let userArr = await db.UserModel.aggregate([
      {$sort: {toc: -1}},
      {$skip: paging.start},
      {$limit: paging.perpage}
    ]);*/
    let userArr = await db.UserModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    for (let i = 0; i < userArr.length; i++) {
      userArr[i] = userArr[i].toObject();
      let userPersonal = await db.UsersPersonalModel.findOne({uid: userArr[i].uid});
      if(userPersonal){
        userArr[i].regIP = userPersonal.regIP;
        userArr[i].regPort = userPersonal.regPort;
      }
    }
    paging.page++;
    ctx.data.page = paging;
    ctx.data.users = userArr;
    ctx.template = 'interface_new_users.pug';
    await next();
  })
  .get('/newSysinfo', async (ctx, next) => {
    ctx.template = 'interface_new_sysinfo.pug';
    await next();
  })
  .post('/newSysinfo', async (ctx, next) => {
    let t1 = Date.now();
    let {title, content} = ctx.body;
    if(!title) ctx.throw(400, '标题不能为空！');
    if(!content) ctx.throw(400, '内容不能为空！');
    let {db} = ctx;
    let newSysinfo = new db.SmsModel({
      fromSystem: true,
      sid: await db.SettingModel.operateSystemID('sms', 1),
      ip: ctx.request.socket._peername.address,
      port: ctx.request.socket._peername.port,
      systemContent: {
        title: title,
        content: content
      }
    });
    try{
      await newSysinfo.save();
      let allUsers = await db.UsersPersonalModel.find({}, {_id: 0, uid: 1, newMessage: 1});
      for (let i  =0; i < allUsers.length; i++) {
        let newMessage = allUsers[i].newMessage;
        newMessage.system++;
        await db.UsersPersonalModel.replaceOne({uid: allUsers[i].uid}, {$set: {newMessage: newMessage}});
        console.log(i);
      }
      console.log('over');
    } catch(err) {
      let t = Date.now() - t1;
      console.log(`耗时： ${t}`);
      // await db.SettingModel.operateSystemID('sms', -1);
      ctx.throw(500, `发送系统通知出错: ${err}`);
    }
    let t = Date.now() - t1;
    console.log(`耗时： ${t}`);
    await next();
  })
  .get('/stats', async (ctx, next) => {
    let {json} = ctx.query;
    if(!json) {
      ctx.template = 'stats.pug';
      return await next();
    }
    let {db} = ctx;
    let {user} = ctx.data;
    let dayStamps = [];
    let today = Date.now();
    dayStamps.push(today);
    today = today - today % 86400000;
    for (let i = 0; i < 240; i++) {
      dayStamps.push(today - i*86400000)
    }
    if(tlv>Date.now()-10000)//within 10s
    {
      ctx.data.stats = buffer;
      return await next();
    }
    dayStamps = dayStamps.sort((i1, i2) => i1 - i2);
    let dayRanges = [];
    for (let i = 0; i < dayStamps.length; i++) {
      dayRanges.push({
        start: dayStamps[i],
        end: dayStamps[i+1]
      });
    }
    let list = [];
    for (let i = 0; i < dayRanges.length; i++) {
      console.log(i);
      let postCount = await db.PostModel.count({toc: {$gt: dayRanges[i].start, $lt: dayRanges[i].end}});
      let postCountDisabled = await db.PostModel.count({toc: {$gt: dayRanges[i].start, $lt: dayRanges[i].end}, disabled: true});
      let userRegistered = await db.UserModel.count({toc: {$gt: dayRanges[i].start, $lt: dayRanges[i].end}});
      list.push({
        start: dayRanges[i].start,
        postCount,
        postCountDisabled,
        userRegistered
      });
    }
    ctx.data.stats = list;
    await next();
  })
  .get('/behaviors', async (ctx, next) => {
    let {db} = ctx;

    ctx.template = 'interface_behavior_log.pug';
    await next();
  });
module.exports = experimentalRouter;