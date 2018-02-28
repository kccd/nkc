const Router = require('koa-router');
const fundLogoRouter = new Router();
fundLogoRouter
	.get('/:fundId', async (ctx, next) => {
		const {settings} = ctx;
		const {fundId} = ctx.params;
		const {fundLogoPath} = settings.upload;
		ctx.filePath = fundLogoPath + '/' + fundId + '.jpg';
		ctx.type = 'jpg';
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, fs, settings, body} = ctx;
		const imageId = Date.now();
		const {fundLogoify} = ctx.tools.imageMagick;
		const {fundLogoPath} = settings.upload;
		const {file} = body.files;
		const {path} = file;
		const targetAvatarFilePath = fundLogoPath + '/' + imageId + '.jpg';
		try {
			await fundLogoify(path, targetAvatarFilePath);
			await fs.unlink(path);
		} catch (err) {
			ctx.throw(500, err);
		}
		data.imageId = imageId;
		await next();
	});
module.exports = fundLogoRouter;