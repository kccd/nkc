const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
router
	.get('/:id', async (ctx, next) => {
		const {settings, params, db, fs} = ctx;
		const {id} = params;
		const {webLogoPath} = settings.upload;
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		if(!homeSettings.logos.includes(id)) ctx.throw(404, 'logo not found');
		const filePath = webLogoPath + '/' + id + '.png';
		stat = await fs.stat(filePath);
		ctx.response.lastModified = stat.mtime.toUTCString();
		ctx.set('Cache-Control', 'public, no-cache');
		ctx.filePath = filePath;
		ctx.type = 'png';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {fs, tools, db, body, settings} = ctx;
		let {position} = body.fields;
		position = JSON.parse(position);
		const {file} = body.files;
		const {webLogoify, webSmallLogoify} = tools.imageMagick;
		const {webLogoPath, webSmallLogoPath} = settings.upload;
		const options = Object.assign({}, position);
		const {type, size, path} = file;
		const ext = mime.getExtension(type);
		const extArr = ['jpg', 'jpeg', 'png'];
		if(!extArr.includes(ext)) ctx.throw('仅支持jpg、jpeg和png格式的图片');
		if(size > 5120*1024) ctx.throw(400, '上传的图片不能大于5Mb');
		options.path = path;
		const t = await db.SettingModel.operateSystemID('logos', 1);
		options.targetPath = webLogoPath + '/' + t + '.png';
		const targetSmallPath = webSmallLogoPath + '/' + t + '.png';
		try {
			await fs.access(webLogoPath);
		} catch (e) {
			await fs.mkdir(webLogoPath);
		}
		try {
			await fs.access(webSmallLogoPath);
		} catch (e) {
			await fs.mkdir(webSmallLogoPath);
		}
		const homeSettings = await db.SettingModel.findOnly({type: 'home'});
		const q = {
			$addToSet: {logos: (''+t)}
		};
		if(!homeSettings.logo) {
			q.logo = (''+t);
		}
		await homeSettings.update(q);
		await webLogoify(options);
		await webSmallLogoify(options.targetPath, targetSmallPath);
		await next();
	});
module.exports = router;