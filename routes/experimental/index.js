const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
let dbFn = nkcModules.dbFunction;
let apiFn = nkcModules.apiFunction;
const experimentalRouter = new Router();

let tlv = 0;
let buffer = [];

experimentalRouter
  .get('/', async (ctx, next) => {
    ctx.data.forumList = await dbFn.getAvailableForums(ctx);
    ctx.data.forumTree = await dbFn.getForums(ctx);
    ctx.template = 'interface_experimental.pug';
    await next();
  })
  .get('/newUsers', async (ctx, next) => {
    const {db, data} = ctx;
    let {page} = ctx.query;
    page = page || 0;
    const userLength = await db.UserModel.count();
    const paging = apiFn.paging(page, userLength);
    let users = await db.UserModel.find().sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    users = await Promise.all(users.map(user => user.extend()));
    data.page = paging;
    data.users = users;
    ctx.template = 'interface_new_users.pug';
    await next();
  })
  .get('/newSysinfo', async (ctx, next) => {
    ctx.template = 'interface_new_sysinfo.pug';
    await next();
  })
  .post('/newSysinfo', async (ctx, next) => {
    const {title, content} = ctx.body;
    if(!title) ctx.throw(400, '标题不能为空！');
    if(!content) ctx.throw(400, '内容不能为空！');
    const {data, db} = ctx;
    const newSysinfo = new db.SmsModel({
      fromSystem: true,
      sid: await db.SettingModel.operateSystemID('sms', 1),
      ip: ctx.request.socket._peername.address,
      port: ctx.request.socket._peername.port,
      systemContent: {
        title: title,
        content: content
      },
      s: data.user.uid
    });
    try{
      await newSysinfo.save();
      await db.UsersPersonalModel.updateMany({}, {$inc: {'newMessage.system': 1}});
    } catch(err) {
      ctx.throw(500, `发送系统通知出错: ${err}`);
    }
    await next();
  })
  .get('/stats', async (ctx, next) => {
    const type = ctx.request.accepts('json', 'html');
    if(type !== 'json') {
      ctx.template = 'stats.pug';
      return await next();
    }
    const {data, db} = ctx;
    const {user} = data;
    let dayStamps = [];
    let today = Date.now();
    dayStamps.push(today);
    today = today - today % 86400000;
    for (let i = 0; i < 240; i++) {
      dayStamps.push(today - i*86400000)
    }
    if(tlv>Date.now()-10000)//within 10s
    {
      data.stats = buffer;
      return await next();
    }
    dayStamps = dayStamps.sort((i1, i2) => i1 - i2);
    const dayRanges = [];
    for (let i = 0; i < dayStamps.length; i++) {
      dayRanges.push({
        start: dayStamps[i],
        end: dayStamps[i+1]
      });
    }
    data.stats =  await Promise.all(dayRanges.map(async dayRange => {
      let postCount = 0, postCountDisabled = 0;
      const targetPosts = await db.PostModel.find({toc: {$gt: dayRange.start, $lt: dayRange.end}}, {disabled: 1});
      targetPosts.map(post => {
        postCount++;
        if(post.disabled) postCountDisabled++;
      });
      const userRegistered = await db.UserModel.count({toc: {$gt: dayRange.start, $lt: dayRange.end}});
      return {
        start: dayRange.start,
        postCount,
        postCountDisabled,
        userRegistered
      };
    }));
    await next();
  })
  .get('/behaviors', async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = 'interface_behavior_log.pug';
    await next();
  })
  .post('/updateAllUsers', async (ctx, next) => {
    const {data, db} = ctx;
    const t = Date.now();
    const userArr = await db.UserModel.find({}, {_id: 0, uid: 1});
    console.log(`查找所有用户uid: ${Date.now()-t}ms`);
    let i = 0;
    for (let user of userArr) {
      i++;
      const t3 = Date.now();
      const targetUser = await db.UserModel.findOne({uid: user.uid});
      await targetUser.updateUserMessage();
      console.log(`总数: ${userArr.length} - 现在: ${i} - uid: ${user.uid} - time: ${Date.now() - t3}ms`);
    }
    console.log(`总耗时: ${Date.now() - t}ms`);
    data.message = '更新所有用户数据成功';
    await next();
  })
  .post('/updateAllForums', async (ctx, next) => {
    const {data, db} = ctx;
    const forums = await db.ForumModel.find({type: 'forum'});
    await Promise.all(forums.map(forum => forum.updateForumMessage()));
    data.message = '更新所有板块数据成功';
    await next();
  })
  .post('/updateAllThreads', async (ctx, next) => {
    const {data, db} = ctx;
    const threadsCount = await db.ThreadModel.count();
    for (let i = 0; 1; i++) {
      if(i >= threadsCount) break;
      const thread = await db.ThreadModel.findOne().skip(i);
      await thread.updateThreadMessage();
      console.log(`${i} - ${thread.tid} - ${threadsCount}`);
    }
    data.message = '更新所有帖子数据成功';
    await next();
  });

module.exports = experimentalRouter;