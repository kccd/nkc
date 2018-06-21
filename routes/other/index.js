const Router = require('koa-router');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const sendMessageRouter = require('./sendMessage');
const examRouter = require('./exam');
const forgotPasswordRouter = require('./forgotPassword');
const homeRouter = require('./home');
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
const searchRouter = require('./search');
const photoRouter = require('./photo');
const photoSmallRouter = require('./photo_small');
const fundBannerRouter = require('./fundBanner');
const fundBannerSmallRouter = require('./fundLogo');
const authRouter = require('./auth');
const forumAvatarRouter = require('./forum_avatar');
const coverRouter = require('./cover');
const pageRouter = require('./page');
const logoRouter = require('./logo');
// -----------------------------------
otherRouter
  .get('/latest', async (ctx, next) => {
    const {db, data} = ctx;
    if(data.userLevel < 0) ctx.throw(403, '根据系统记录，你的账号已经被封禁，请重新注册。');
    const {user} = data;
    const {content} = ctx.query;
    data.content = content || 'all';
    data.navbar = {highlight: 'home'};
    const {ThreadModel} = ctx.db;
    const visibleFid = await ctx.getVisibleFid();
    data.newestDigestThreads = await ThreadModel.aggregate([
      {$sort: {toc: -1}},
      {
        $match: {
          fid: {$in: visibleFid},
          disabled: false,
          digest: true
        }
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
        $match: {'firstPost.hasImage': true}
      },
      {$lookup: {
        from: 'users',
        localField: 'firstPost.uid',
        foreignField: 'uid',
        as: 'firstPost.user'
      }},
      {$lookup: {
        from: 'resources',
        localField: 'firstPost.pid',
        foreignField: 'references',
        as: 'firstPost.resources'
      }},
      {$limit: 200},
      {$sample: {size: 6}}
    ]);
    // data.newestDigestThreads = await Promise.all(tidArr.map(async thread => {
    //   await thread.extendFirstPost().then(async p => {
    //     await p.extendUser();
    //     await p.extendResources();
    //   });
    //   for (let r of thread.firstPost.resources) {
    //     if(imgArr.includes(r.ext)) {
    //       thread.src = r.rid;
    //       break;
    //     }
    //   }
    //   return thread;
    // }));

    let latestThreads = await db.ThreadModel.find({fid: {$in: visibleFid}}).sort({tlm: -1}).limit(home.indexLatestThreadsLength);
    latestThreads = await Promise.all(latestThreads.map(async thread => {
      await thread.extendFirstPost().then(p => p.extendUser());
      await thread.firstPost.extendResources();
      await thread.extendLastPost().then(p => p.extendUser());
      await thread.extendForum();
      return thread;
    }));
    data.latestThreads = latestThreads;
    const activeUsers = await db.ActiveUserModel.find().sort({vitality: -1}).limit(home.activeUsersLength);
    await Promise.all(activeUsers.map(activeUser => activeUser.extendUser()));
    data.activeUsers = activeUsers;
    data.forumList = await dbFn.getAvailableForums(ctx);
    data.fTarget = 'home';
    const systemSetting = await db.SettingModel.findOnly({type: 'system'});
    data.ads = await systemSetting.extendAds();
    if(data.user) data.userThreads = await data.user.getUsersThreads();
    ctx.template = 'interface_home.pug';
    await next();
  })
	.get('index.php', async (ctx, next) => {
		const {fid} = ctx.query;
    ctx.status = 301;
		if(fid) {
			return ctx.redirect(`/f/${fid}`);
		}
		return ctx.redirect(`/`);
	})
	.get('read.php', async (ctx, next) => {
		const {tid} = ctx.query;
		ctx.status = 301;
		if(tid) {
			return ctx.redirect(`/t/${tid}`);
		}
		return ctx.redirect(`/`);
	})
  .use('login', loginRouter.routes(), loginRouter.allowedMethods())
	.use('logo', logoRouter.routes(), logoRouter.allowedMethods())
  .use('logout', logoutRouter.routes(), logoutRouter.allowedMethods())
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
  .use('', homeRouter.routes(), homeRouter.allowedMethods())
  .use('rt', rtRouter.routes(), rtRouter.allowedMethods())
  .use('qr', qrCodeRouter.routes(), qrCodeRouter.allowedMethods())
  .use('search', searchRouter.routes(), searchRouter.allowedMethods())
  .use('ad', adRouter.routes(), adRouter.allowedMethods())
  .use('default', defaultRouter.routes(), defaultRouter.allowedMethods())
	.use('photo', photoRouter.routes(), photoRouter.allowedMethods())
	.use('photo_small', photoSmallRouter.routes(), photoSmallRouter.allowedMethods())
	.use('fundBanner', fundBannerRouter.routes(), fundBannerRouter.allowedMethods())
	.use('fundLogo', fundBannerSmallRouter.routes(), fundBannerSmallRouter.allowedMethods())
	.use('auth', authRouter.routes(), authRouter.allowedMethods())
	.use('forum_avatar', forumAvatarRouter.routes(), forumAvatarRouter.allowedMethods())
	.use('page', pageRouter.routes(), pageRouter.allowedMethods())
  .use('cover', coverRouter.routes(), coverRouter.allowedMethods());
module.exports = otherRouter;