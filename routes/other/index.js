const Router = require('koa-router');
const logoutRouter = require('./logout');
const sendMessageRouter = require('./sendMessage');
const otherRouter = new Router();
const editorRouter = require('./editor');
const shopLogo = require('./shopLogo');
const resourcesRouter = require('./resources');
const attachIconRouter = require('./attachIcon');
const adRouter = require('./ad');
const rtRouter = require('./rt');
const rmRouter = require('./rm');
const roRouter = require('./ro');
const qrCodeRouter = require('./qrcode');
const photoRouter = require('./photo');
const photoSmallRouter = require('./photo_small');
const fundBannerRouter = require('./fundBanner');
const fundBannerSmallRouter = require('./fundLogo');
const frameImgRouter = require('./frameImg');
const posterRouter = require('./poster');
const pageRouter = require('./page');
const appDownload = require("./appDownload");
const founderInvite = require("./founderInvite");
const testRouter = require('./test');
otherRouter
	.get([
		'forum.php',
		'home.php',
		'index.php',
		'read.php',
		'read/:tid/:a/:b',
		'read/:tid',
		'read/:tid/:a',
		'read/:tid/:a/',
	], async (ctx, next) => {
		let {tid, fid, uid} = ctx.query;
		tid = tid || ctx.params.tid;
		ctx.status = 301;
		if(tid) {
			return ctx.redirect(`/t/${tid}`);
		} else if(uid) {
			return ctx.redirect(`/u/${uid}`);
		} else if(fid) {
			return ctx.redirect(`/f/${fid}`);
		} else {
			ctx.throw(404, 'not found');
			await next();
		}
	})
  .use('logout', logoutRouter.routes(), logoutRouter.allowedMethods())
  .use('sendMessage', sendMessageRouter.routes(), sendMessageRouter.allowedMethods())
  .use('edit', editorRouter.routes(), editorRouter.allowedMethods())
  .use('shopLogo', shopLogo.routes(), shopLogo.allowedMethods())
  .use('resources', resourcesRouter.routes(), resourcesRouter.allowedMethods())
  .use('rt', rtRouter.routes(), rtRouter.allowedMethods())
  .use('rm', rmRouter.routes(), rmRouter.allowedMethods())
  .use('ro', roRouter.routes(), roRouter.allowedMethods())
  .use('qr', qrCodeRouter.routes(), qrCodeRouter.allowedMethods())
  .use('ad', adRouter.routes(), adRouter.allowedMethods())
  .use('attachIcon', attachIconRouter.routes(), attachIconRouter.allowedMethods())
	.use('photo', photoRouter.routes(), photoRouter.allowedMethods())
	.use('photo_small', photoSmallRouter.routes(), photoSmallRouter.allowedMethods())
	.use('fundBanner', fundBannerRouter.routes(), fundBannerRouter.allowedMethods())
	.use('fundLogo', fundBannerSmallRouter.routes(), fundBannerSmallRouter.allowedMethods())
	.use('page', pageRouter.routes(), pageRouter.allowedMethods())
  .use('frameImg', frameImgRouter.routes(), frameImgRouter.allowedMethods())
  .use('poster', posterRouter.routes(), posterRouter.allowedMethods())
	.use("appDownload", appDownload.routes(), appDownload.allowedMethods())
	.use("founderInvite", founderInvite.routes(), founderInvite.allowedMethods())
  .use('test', testRouter.routes(), testRouter.allowedMethods());
module.exports = otherRouter;
