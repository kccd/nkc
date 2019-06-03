const Router = require('koa-router');
const forumAvatarRouter = new Router();
const mime = require('mime');
forumAvatarRouter
	.get('/:fid', async (ctx, next) => {
		const {db, params} = ctx;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		const {iconFileName} = forum;
		const {siteSpecificPath} = ctx.settings.statics;
		ctx.filePath = siteSpecificPath + '/forum_icon/' + (iconFileName) + '.png';
		ctx.type = 'png';
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		await next();
	})
	.post('/:fid', async (ctx, next) => {
		const {db, params, body, tools, settings, fs} = ctx;
		const {fid} = params;
		const forum = await db.ForumModel.findOnly({fid});
		const {file} = body.files;
		const {position} = body.fields;
		const positionObj = JSON.parse(position);
		if(positionObj.width > 5000 || positionObj.height > 5000) ctx.throw(400, '截取的图片范围过小');
		const {type, size, path} = file;
		const ext = mime.getExtension(type);
		const extArr = ['jpg', 'jpeg', 'png'];
		if(!extArr.includes(ext)) ctx.throw('仅支持jpg、jpeg和png格式的图片');
		if(size > 5120*1024) ctx.throw(400, '上传的图片不能大于5MB');
		const {forumAvatarify} = tools.imageMagick;
		const {siteSpecificPath} = settings.statics;
		const targetPath = siteSpecificPath + '/forum_icon/' + forum.fid + '.png';
		positionObj.path = path;
		positionObj.targetPath = targetPath;
		await forumAvatarify(positionObj);
		await fs.unlink(path);
		await forum.update({iconFileName: forum.fid});
		await next();
	});
module.exports = forumAvatarRouter;