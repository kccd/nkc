const Router = require('koa-router');
const fundAvatarRouter = new Router();
fundAvatarRouter
	.get('/:fundId', async (ctx, next) => {
		const {settings} = ctx;
		const {fundId} = ctx.params;
		const {fundAvatarPath} = settings.upload;
		ctx.filePath = fundAvatarPath + '/' + fundId + '.jpg';
		ctx.type = 'jpg';
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, fs, settings, body} = ctx;
		const imageId = Date.now();
		const {fundAvatarify} = ctx.tools.imageMagick;
		const {fundAvatarPath} = settings.upload;
		const {file} = body.files;
		const {path} = file;
		const targetAvatarFilePath = fundAvatarPath + '/' + imageId + '.jpg';
		try {
			await fundAvatarify(path, targetAvatarFilePath);
			await fs.unlink(path);
		} catch (err) {
			ctx.throw(500, err);
		}
		data.imageId = imageId;
		await next();
	});
module.exports = fundAvatarRouter;