const Router = require('koa-router');
const fundBannerRouter = new Router();
fundBannerRouter
	.get('/:fundId', async (ctx, next) => {
		const {settings} = ctx;
		const {fundId} = ctx.params;
		const {fundBannerPath} = settings.upload;
		ctx.filePath = fundBannerPath + '/' + fundId + '.jpg';
		ctx.type = 'jpg';
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, fs, settings, body} = ctx;
		const imageId = Date.now();
		const {fundBannerify} = ctx.tools.imageMagick;
		const {fundBannerPath} = settings.upload;
		const {file} = body.files;
		const {path} = file;
		const targetFilePath = fundBannerPath + '/' + imageId + '.jpg';
		try {
			await fundBannerify(path, targetFilePath);
			await fs.unlink(path);
		} catch (err) {
			ctx.throw(500, err);
		}
		data.imageId = imageId;
		await next();
	});
module.exports = fundBannerRouter;