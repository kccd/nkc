const Router = require('koa-router');
const bannerRouter = new Router();
bannerRouter
	.use('/', async (ctx, next) => {
		const {fs, settings} = ctx;
		const {userBannerPath} = settings.upload;
		try{
			await fs.access(userBannerPath);
		} catch(err) {
			await fs.mkdir(userBannerPath);
		}
		await next();
	})
	.get('/', async (ctx, next) => {
		console.log(Date.now());
		const {data, db, params, settings, fs} = ctx;
		const {uid} = params;
		const {userBannerPath} = settings.upload;
		const {defaultUserBannerPath} = settings.statics;
		let path = userBannerPath + '/' + uid + '.jpg';
		try{
			const stat = await fs.stat(path);
			ctx.response.lastModified = stat.mtime.toUTCString();
			ctx.set('Cache-Control', 'public, no-cache');
			ctx.filePath = path;
		} catch(err) {
			ctx.filePath = defaultUserBannerPath;
			ctx.response.lastModified = new Date(1999, 9, 9);
			ctx.set('Cache-Control', 'public, no-cache');
		}
		ctx.type = 'jpg';
		await next();
	})
	.patch('/', async (ctx, next) => {
		await next();
	});
module.exports = bannerRouter;