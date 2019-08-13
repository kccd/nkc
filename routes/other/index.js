const Router = require('koa-router');
const logoutRouter = require('./logout');
const sendMessageRouter = require('./sendMessage');
const smsRouter = require('./sms');
const otherRouter = new Router();
const editorRouter = require('./editor');
const shopLogo = require('./shopLogo');
const resourcesRouter = require('./resources');
const defaultRouter = require('./default');
const attachIconRouter = require('./attachIcon');
const pfAvatar = require('./pfAvatar');
const pfBanner = require('./pfBanner');
const adRouter = require('./ad');
const rtRouter = require('./rt');
const rmRouter = require('./rm');
const roRouter = require('./ro');
const qrCodeRouter = require('./qrcode');
const photoRouter = require('./photo');
const photoSmallRouter = require('./photo_small');
const fundBannerRouter = require('./fundBanner');
const fundBannerSmallRouter = require('./fundLogo');
const authRouter = require('./auth');
const forumAvatarRouter = require('./forum_avatar');
const coverRouter = require('./cover');
const frameImgRouter = require('./frameImg');
const posterRouter = require('./poster');
const pageRouter = require('./page');
const logoRouter = require('./logo');
const appDownloadRouter = require('./appDownload');
const testRouter = require('./test');
otherRouter
  .get('/latest', async (ctx, next) => {

    await next();
  })
	.get('index.php', async (ctx, next) => {
    const {nkcModules} = ctx;
		const {fid} = ctx.query;
    ctx.status = 301;
		if(fid) {
			return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/f/${fid}`));
		}
		return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/`));
	})
	.get('read.php', async (ctx, next) => {
    const {nkcModules} = ctx;
		const {tid} = ctx.query;
		ctx.status = 301;
		if(tid) {
			return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/t/${tid}`));
		}
		return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/`));
	})
	.use('logo', logoRouter.routes(), logoRouter.allowedMethods())
  .use('logout', logoutRouter.routes(), logoutRouter.allowedMethods())
  .use('sendMessage', sendMessageRouter.routes(), sendMessageRouter.allowedMethods())
  .use('editor', editorRouter.routes(), editorRouter.allowedMethods())
  .use('sms', smsRouter.routes(), smsRouter.allowedMethods())
  .use('shopLogo', shopLogo.routes(), shopLogo.allowedMethods())
  .use('resources', resourcesRouter.routes(), resourcesRouter.allowedMethods())
  .use('pfa', pfAvatar.routes(), pfAvatar.allowedMethods())
  .use('pfb', pfBanner.routes(), pfBanner.allowedMethods())
  .use('rt', rtRouter.routes(), rtRouter.allowedMethods())
  .use('rm', rmRouter.routes(), rmRouter.allowedMethods())
  .use('ro', roRouter.routes(), roRouter.allowedMethods())
  .use('qr', qrCodeRouter.routes(), qrCodeRouter.allowedMethods())
  .use('ad', adRouter.routes(), adRouter.allowedMethods())
  .use('default', defaultRouter.routes(), defaultRouter.allowedMethods())
  .use('attachIcon', attachIconRouter.routes(), attachIconRouter.allowedMethods())
	.use('photo', photoRouter.routes(), photoRouter.allowedMethods())
	.use('photo_small', photoSmallRouter.routes(), photoSmallRouter.allowedMethods())
	.use('fundBanner', fundBannerRouter.routes(), fundBannerRouter.allowedMethods())
	.use('fundLogo', fundBannerSmallRouter.routes(), fundBannerSmallRouter.allowedMethods())
	.use('auth', authRouter.routes(), authRouter.allowedMethods())
	.use('forum_avatar', forumAvatarRouter.routes(), forumAvatarRouter.allowedMethods())
	.use('page', pageRouter.routes(), pageRouter.allowedMethods())
  .use('cover', coverRouter.routes(), coverRouter.allowedMethods())
  .use('frameImg', frameImgRouter.routes(), frameImgRouter.allowedMethods())
  .use('poster', posterRouter.routes(), posterRouter.allowedMethods())
  .use('test', testRouter.routes(), testRouter.allowedMethods())
  .use('appDownload', appDownloadRouter.routes(), appDownloadRouter.allowedMethods());
module.exports = otherRouter;