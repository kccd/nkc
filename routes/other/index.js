const Router = require('koa-router');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const registerRouter = require('./register');
const sendMessageRouter = require('./sendMessage');
const examRouter = require('./exam');
const forgotPasswordRouter = require('./forgotPassword');
const smsRouter = require('./sms');
const otherRouter = new Router();
const editorRouter = require('./editor');
const avatar = require('./avatar');
const avatarSmall = require('./avatar_small');
const siteSpecific = require('./site_specific');
const defaultRouter = require('./default');
const settings = require('../../settings');
const {home} = settings;
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
// -----------------------------------
otherRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const {content} = ctx.query;
    data.content = content || 'all';

    let t = Date.now();

    const visibleFid = await ctx.getVisibleFid();
    let tidArr = await db.ThreadModel.find({
      disabled: false,
      digest: true,
      fid: {$in: visibleFid, $ne: '97', $ne: 'recycle'}
    },{
      _id: 0,
      tid: 1
    }).sort({toc: -1});
    let number = 0;
    const targetThreads = [];
    const imgArr = ['jpg', 'png', 'svg', 'jpeg'];
    for (let tid of tidArr) {
      const thread = await db.ThreadModel.findOnly({tid: tid.tid});
      const targetThread = await thread.extend();
      for (let r of targetThread.oc.resources) {
        if(imgArr.includes(r.ext)){
          number++;
          targetThread.src = r.rid;
          targetThreads.push(targetThread);
          break;
        }
      }
      if(number >= 200) break;
    }
    const temp = [];
    for (let i = 0; i < 6; i++) {
      let j = 200 - i;
      let index = Math.floor(Math.random() * j);
      temp.push(targetThreads[index]);
      targetThreads.splice(index, 1);
    }
    data.newestDigestThreads = temp;

    let t1 = Date.now();

    let latestThreads = await db.ThreadModel.find({fid: {$in: visibleFid}}).sort({tlm: -1}).limit(home.indexLatestThreadsLength);
    latestThreads = await Promise.all(latestThreads.map(thread => thread.extend()));
    data.latestThreads = latestThreads;

    let t2 = Date.now();

    data.activeUsers = await db.ActiveUserModel.find().sort({vitality: -1}).limit(home.activeUsersLength);
    data.indexForumList = await dbFn.getAvailableForums(ctx);
    data.fTarget = 'home';
    const systemSetting = await db.SettingModel.findOnly({uid: 'system'});
    data.ads = (await systemSetting.extend()).ads;

    let t3 = Date.now();
    if(data.user) data.userThreads = await data.user.getUsersThreads();

    let t4 = Date.now();
    console.log(`随机加精帖子6： ${t1-t}ms, 最新帖子20： ${t2-t1}ms, 活跃用户、板块列表、ads： ${t3-t2}ms, 加载用户发过的帖子： ${t4-t3}ms`)

    ctx.template = 'interface_home.pug';
    await next();
  })
  .use('login', loginRouter.routes(), loginRouter.allowedMethods())
  .use('logout', logoutRouter.routes(), logoutRouter.allowedMethods())
  .use('register', registerRouter.routes(), registerRouter.allowedMethods())
  .use('sendMessage', sendMessageRouter.routes(), sendMessageRouter.allowedMethods())
  .use('exam', examRouter.routes(), examRouter.allowedMethods())
  .use('forgotPassword', forgotPasswordRouter.routes(), forgotPasswordRouter.allowedMethods())
  .use('editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use('sms', smsRouter.routes(), smsRouter.allowedMethods())
  .use('avatar', avatar.routes(), avatar.allowedMethods())
  .use('avatar_small', avatarSmall.routes(), avatarSmall.allowedMethods())
  .use('site_specific', siteSpecific.routes(), siteSpecific.allowedMethods())
  .use('default', defaultRouter.routes(), defaultRouter.allowedMethods());
module.exports = otherRouter;
