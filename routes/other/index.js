const Router = require('koa-router');
// const loginRouter = require('./login');
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
  // .use('login', loginRouter.routes(), loginRouter.allowedMethods())
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