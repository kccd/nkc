const Router = require('koa-router');
const fundBGISmallRouter = new Router();
fundBGISmallRouter
	.get('/:fundId', async (ctx, next) => {
		const {settings} = ctx;
		const {fundId} = ctx.params;
		const {fundBGISmallPath} = settings.upload;
		ctx.filePath = fundBGISmallPath + '/' + fundId + '.jpg';
		await next();
	});
module.exports = fundBGISmallRouter;