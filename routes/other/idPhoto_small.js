const Router = require('koa-router');
const idPhotoSmallRouter = new Router();
const {idPhotoSmallPath} = require('../../settings').upload;
idPhotoSmallRouter
	.get('/:id', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const {id} = ctx.params;
		const idPhoto = await db.IdPhotoModel.findOnly({_id: id});
		if(idPhoto._id !== user.uid && data.userLevel < 7) ctx.throw(401, '权限不足');
		ctx.filePath = idPhotoSmallPath + '/' + idPhoto._id + '.jpg';
		await next();
	});
module.exports = idPhotoSmallRouter;