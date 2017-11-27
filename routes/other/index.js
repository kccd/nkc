const Router = require('koa-router');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const registerRouter = require('./register');
const sendMessageRouter = require('./sendMessage');
const examRouter = require('./exam');
const forgotPasswordRouter = require('./forgotPassword');
const latestRouter = require('./latest');
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
const pfAvatar = require('./pfAvatar');
const pfBanner = require('./pfBanner');
// -----------------------------------
otherRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const {content} = ctx.query;
    data.content = content || 'all';
    data.navbar = {highlight: 'home'};
    let t = Date.now();

    const visibleFid = await ctx.getVisibleFid();

    let threads = await db.ThreadModel.find(
      {
        fid: {$in: visibleFid},
        hasImage: true,
        disabled: false,
        digest: true
      }
    ).sort(
      {
        toc: -1
      }
    ).limit(200);

    const imgArr = ['jpg', 'png', 'svg', 'jpeg'];
    const temp = [];
    for (let i = 0; i < 6; i++) {
      let j = 200 - i;
      let index = Math.floor(Math.random() * j);
      const targetThread = await threads[index].extend();
      for (let r of targetThread.oc.resources) {
        if(imgArr.includes(r.ext)){
          targetThread.src = r.rid;
          break;
        }
      }
      temp.push(targetThread);
      threads.splice(index, 1);
    }
    data.newestDigestThreads = temp;

    let t1 = Date.now();

    let latestThreads = await db.ThreadModel.find({fid: {$in: visibleFid}}).sort({tlm: -1}).limit(home.indexLatestThreadsLength);
    latestThreads = await Promise.all(latestThreads.map(async thread => {
      const targetThread = await thread.extend();
      return targetThread;
    }));
    data.latestThreads = latestThreads;

    let t2 = Date.now();

    let activeUsers = await db.ActiveUserModel.find().sort({vitality: -1}).limit(home.activeUsersLength);
    activeUsers = await Promise.all(activeUsers.map(activeUser => activeUser.extend()));
    data.activeUsers = activeUsers;
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
  .use('pfa', pfAvatar.routes(), pfAvatar.allowedMethods())
  .use('pfb', pfBanner.routes(), pfBanner.allowedMethods())
  .use('latest', latestRouter.routes(), latestRouter.allowedMethods())
  .use('default', defaultRouter.routes(), defaultRouter.allowedMethods());
module.exports = otherRouter;
