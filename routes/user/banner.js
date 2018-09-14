const Router = require('koa-router');
const mime = require('mime');
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
	.post('/', async (ctx, next) => {
		const {settings, data, fs, tools, params, body} = ctx;
		const {uid} = params;
		const {user} = data;
		if(!user || uid !== user.uid) ctx.throw(403, '权限不足');
		const {position} = body.fields;
		const {file} = body.files;
		if(!file) ctx.throw(400, 'no file uploaded');
		const {path, type, size} = file;
		if(size > ctx.settings.upload.sizeLimit.photo) ctx.throw(400, '图片不能超过20M');
		let options = {};
		const extArr = ['jpg', 'jpeg', 'png'];
		const {imageMagick} = tools;
		const extension = mime.getExtension(type);
		if(!extArr.includes(extension)) {
			ctx.throw(400, 'wrong mimetype for avatar...jpg, jpeg or png only.');
		}
		const saveName = uid + '.jpg';
		const {userBannerPath} = settings.upload;
		const targetFile = userBannerPath + '/' + saveName;
		if(position) {
			const positionObj = JSON.parse(position);
			if(positionObj.width > 5000 || positionObj.height > 5000) ctx.throw(400, '截取的图片范围过小');
			options = Object.assign({}, positionObj);
			options.needCrop = true;
		}

		options.path = path;
		options.targetPath = targetFile;
		await imageMagick.userBannerify(options);
		await fs.unlink(path);
		await next();
	});
module.exports = bannerRouter;