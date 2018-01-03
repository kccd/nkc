const Router = require('koa-router');
const fundBGIRouter = new Router();
fundBGIRouter
	.get('/:fundId', async (ctx, next) => {
		const {data, db, fs, settings} = ctx;
		const {fundId} = ctx.params;
		const {fundBGIPath} = settings.upload;
		ctx.filePath = fundBGIPath + '/' + fundId + '.jpg';
		await next();
	})
	.post('/:fundId', async (ctx, next) => {
		const {fs, db, settings, body} = ctx;
		const {fundId} = ctx.params;
		const {fundBGIify, fundBGISmallify} = ctx.tools.imageMagick;
		const {fundBGIPath, fundBGISmallPath} = settings.upload;
		const {file} = body.files;
		const {path} = file;
		const targetFilePath = fundBGIPath + '/' + fundId + '.jpg';
		const targetSmallFilePath = fundBGISmallPath + '/' + fundId + '.jpg';
		try {
			await fundBGIify(path, targetFilePath);
			await fundBGISmallify(path, targetSmallFilePath);
			await fs.unlink(path);
		} catch (err) {
			ctx.throw(500, err);
		}
		const fund = await db.FundModel.findOnly({_id: fundId});
		await fund.update({image: true});
		await next();
	});
module.exports = fundBGIRouter;