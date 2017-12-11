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
const resourcesRouter = require('./resources');
const defaultRouter = require('./default');
const settings = require('../../settings');
const {home} = settings;
const nkcModules = require('../../nkcModules');
const dbFn = nkcModules.dbFunction;
const pfAvatar = require('./pfAvatar');
const pfBanner = require('./pfBanner');
const adRouter = require('./ad');
const rtRouter = require('./rt');
const qrCodeRouter = require('./qrcode');
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
    const imgArr = ['jpg', 'png', 'svg', 'jpeg'];
    let tidArr = await db.ThreadModel.aggregate([
      {$sort: {toc: -1}},
      {
        $match: {
          fid: {$in: visibleFid},
          disabled: false,
          digest: true
        }
      },
      {
        $project: {tid: 1, _id: 0, oc: 1},
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'oc',
          foreignField: 'pid',
          as: 'firstPost'
        }
      },
      {
        $unwind: '$firstPost'
      },
      {
        $unwind: '$firstPost.r'
      },
      {
        $lookup: {
          from: 'resources',
          localField: 'firstPost.r',
          foreignField: 'rid',
          as: 'resource'
        }
      },
      {
        $project: {tid: 1, resource: 1}
      },
      {
        $match: {'resource': {$elemMatch: {ext: {$in: imgArr}}}}
      },
      {$group: {_id: '$tid'}},
      {$limit: 200},
      {$sample: {size: 6}}
    ]);
    const threads = await db.ThreadModel.find({tid: {$in: tidArr}});
    data.newestDigestThreads = await Promise.all(threads.map(async thread => {
      await thread.extendFirstPost().then(async p => {
        await p.extendUser();
        await p.extendResources();
      });
      for (let r of thread.firstPost.resources) {
        if(imgArr.includes(r.ext)) {
          thread.src = r.rid;
          break;
        }
      }
      return thread;
    }));
    let t1 = Date.now();

    let latestThreads = await db.ThreadModel.find({fid: {$in: visibleFid}}).sort({tlm: -1}).limit(home.indexLatestThreadsLength);
    latestThreads = await Promise.all(latestThreads.map(async thread => {
      await thread.extendFirstPost().then(p => p.extendUser());
      await thread.extendLastPost().then(p => p.extendUser());
      await thread.extendForum();
      return thread;
    }));
    data.latestThreads = latestThreads;

    let t2 = Date.now();

    const activeUsers = await db.ActiveUserModel.find().sort({vitality: -1}).limit(home.activeUsersLength);
    await Promise.all(activeUsers.map(activeUser => activeUser.extendUser()));
    data.activeUsers = activeUsers;
    data.indexForumList = await dbFn.getAvailableForums(ctx);
    data.fTarget = 'home';
    const systemSetting = await db.SettingModel.findOnly({uid: 'system'});
    data.ads = await systemSetting.extendAds();

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
  .use('resources', resourcesRouter.routes(), resourcesRouter.allowedMethods())
  .use('pfa', pfAvatar.routes(), pfAvatar.allowedMethods())
  .use('pfb', pfBanner.routes(), pfBanner.allowedMethods())
  .use('latest', latestRouter.routes(), latestRouter.allowedMethods())
  .use('rt', rtRouter.routes(), rtRouter.allowedMethods())
  .use('qr', qrCodeRouter.routes(), qrCodeRouter.allowedMethods())
  .use('ad', adRouter.routes(), adRouter.allowedMethods())
  .use('default', defaultRouter.routes(), defaultRouter.allowedMethods());
module.exports = otherRouter;
