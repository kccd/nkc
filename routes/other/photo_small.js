const Router = require('koa-router');
const path = require('path');
const photoSmallRouter = new Router();
const {photoSmallPath} = require('../../settings').upload;
photoSmallRouter
	.get('/:id', async (ctx, next) => {
		const {data, db, fs} = ctx;
		const {user} = data;
		const {id} = ctx.params;
		const photo = await db.PhotoModel.findOnly({_id: id});
		if(photo.type === 'fund') {
			// const applicationForm = db.FundApplicationFormModel.findOnly({_id: photo.applicationFormId});
		} else if(photo.uid !== user.uid && data.userLevel < 7) {
			ctx.throw(403, '权限不足');
		}
		ctx.filePath = photoSmallPath + photo.path;
		if(photo.status === 'deleted') {
			ctx.filePath = path.resolve(__dirname, '../../resources/default_things/deleted_photo.jpg');
		}
		if(photo.status === 'disabled') {
			ctx.filePath = path.resolve(__dirname, '../../resources/default_things/disabled_photo.jpg');
		}
		try{
			await fs.access(ctx.filePath);
		} catch(err) {
			ctx.filePath = path.resolve(__dirname, '../../resources/default_things/deleted_photo.jpg');
		}
		ctx.type = 'jpg';
		ctx.set('Cache-Control', 'public, no-cache');
		const tlm = await ctx.fs.stat(ctx.filePath);
		ctx.lastModified = new Date(tlm.mtime).toUTCString();
		await next();
	});
module.exports = photoSmallRouter;