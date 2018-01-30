const Router = require('koa-router');
const fundBGISmallRouter = new Router();
fundBGISmallRouter
	.get('/:fundId', async (ctx, next) => {
		const {settings} = ctx;
		const {fundId} = ctx.params;
		const {fundBGISmallPath} = settings.upload;
		ctx.filePath = fundBGISmallPath + '/' + fundId + '.jpg';
		ctx.type = 'jpg';
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		await next();
	});
module.exports = fundBGISmallRouter;