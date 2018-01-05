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
	.post('/', async (ctx, next) => {
		const {data, fs, db, settings, body} = ctx;
		const imageId = Date.now();
		const {fundBGIify, fundBGISmallify} = ctx.tools.imageMagick;
		const {fundBGIPath, fundBGISmallPath} = settings.upload;
		const {file} = body.files;
		const {path} = file;
		const targetFilePath = fundBGIPath + '/' + imageId + '.jpg';
		const targetSmallFilePath = fundBGISmallPath + '/' + imageId + '.jpg';
		try {
			await fundBGIify(path, targetFilePath);
			await fundBGISmallify(path, targetSmallFilePath);
			await fs.unlink(path);
		} catch (err) {
			ctx.throw(500, err);
		}
		data.imageId = imageId;
		await next();
	});
module.exports = fundBGIRouter;