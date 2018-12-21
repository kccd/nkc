const Router = require('koa-router');
const router = new Router();
const mime = require('mime');
router
	.get('/:id', async (ctx, next) => {
		const {settings, params, db, fs} = ctx;
		const {id} = params;
		const {webLogoPath} = settings.upload;
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		if(!homeSettings.c.logos || !homeSettings.c.logos.includes(id)) ctx.throw(404, 'logo not found');
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
		const {file} = body.files;
		const {webLogoify} = tools.imageMagick;
		const {webLogoPath} = settings.upload;
		const {type, size, path} = file;
		const ext = mime.getExtension(type);
		const extArr = ['jpg', 'jpeg', 'png'];
		if(!extArr.includes(ext)) ctx.throw('仅支持jpg、jpeg和png格式的图片');
		if(size > 5120*1024) ctx.throw(400, '上传的图片不能大于5Mb');
		const t = await db.SettingModel.operateSystemID('logos', 1);
		const targetPath = webLogoPath + '/' + t + '.png';
		try {
			await fs.access(webLogoPath);
		} catch (e) {
			await fs.mkdir(webLogoPath);
		}
		const homeSettings = await db.SettingModel.findOnly({_id: 'home'});
		await webLogoify(path, targetPath);
		await homeSettings.update({
      $addToSet: {
        'c.logos': ('' + t)
      }
    });
		await next();
	});
module.exports = router;