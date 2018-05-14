const Router = require('koa-router');
const forumRouter = require('./forum');
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const apiFn = nkcModules.apiFunction;
const {npmInstallify, gitify} = require('../../tools/imageMagick');
const experimentalRouter = new Router();

let tlv = 0;
let buffer = [];

experimentalRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.forums = await db.ForumModel.find({parentId: ''}).sort({order: 1});
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
    await Promise.all(users.map(user => user.extend()));
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
      ip: ctx.address,
      port: ctx.port,
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
  .get('/behavior', async (ctx, next) => {
    const {data, db} = ctx;
    const {from, ip, to, type, sort} = ctx.query;
    data.from = from;
    data.to = to;
    data.type = type || '';
    data.sort = sort;
    data.ip = ip
    const q = [{operation: {$nin: ['viewThread', 'viewForum', 'viewUserCard', 'viewUserPersonalForum']}}];
    const s = {timeStamp: -1};
    const page = ctx.query.page || 0;
    if(from) q.push({uid: from});
    if(to) q.push({toUid: to});
    if(ip) q.push({ip});
    if(type === 'management') {
      q.push({isManageOp: true});
    } else if(type === 'normal') {
      q.push({isManageOp: false});
    } else {
      q.push({timeStamp: {$ne: null}})
    }
    if(sort) s.timeStamp = 1;
    const length = await db.UsersBehaviorModel.count({$and: q});
    const paging = apiFn.paging(page, length);
    data.paging = paging;
    const usersBehavior = await db.UsersBehaviorModel.find({$and: q}).sort(s).skip(paging.start).limit(paging.perpage);
    data.behaviorLogs = await Promise.all(usersBehavior.map(async log => {
      log.user = await db.UserModel.findOnly({uid: log.uid});
      log.toUser = await db.UserModel.findOnly({uid: log.toUid});
      if(log.tid) {
        log.thread = await db.ThreadModel.findOnly({tid: log.tid});
        log.link = `/t/${log.tid}`;
      }
      if(log.pid) {
        const {pid} = log;
        log.post = await db.PostModel.findOnly({pid: pid});
        let {page} = await log.thread.getStep({pid});
        page = `?page=${page}`;
        log.link += `${page}#${pid}`;
      }
      return log;
    }));
    ctx.template = 'interface_behavior_log.pug';
    await next();
  })
  .get('/new_forum', async (ctx, next) => {
    const {data, db, allContentClasses} = ctx;
    const {ForumModel} = db;
    data.allContentClasses = allContentClasses;
    data.parentForums = await ForumModel.find({type: 'category'});
    ctx.template = 'interface_new_forum.pug';
    return next()
  })
  .patch('/npmInstall', async (ctx, next) => {
    ctx.data.message = await npmInstallify();
    await next();
  })
  .patch('/gitPull', async (ctx, next) => {
    ctx.data.message = await gitify();
    await next();
  })
	.use('/forum', forumRouter.routes(), forumRouter.allowedMethods());

module.exports = experimentalRouter;