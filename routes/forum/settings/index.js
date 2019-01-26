const Router = require('koa-router');
const settingsRouter = new Router();
const infoRouter = require('./info');
const imageRouter = require('./image');
const categoryRouter = require('./category');
const permissionRouter = require('./permission');
settingsRouter
	.use('/', async (ctx, next) => {
		const {data, db, params, url} = ctx;
		const {fid} = params;
		data.forum = await db.ForumModel.findOnly({fid});
		data.forums = await db.ForumModel.find({}).sort({order: 1});
		const urlArr = url.split('/');
		const type = urlArr[urlArr.length-1];
		data.type = (type === 'settings'?'info': type);
    data.breadcrumbForums = await data.forum.getBreadcrumbForums();
		const length = data.breadcrumbForums.length;
    data.level1Forums = await db.ForumModel.find({parentsId: []}).sort({order: 1});
		if(length === 0) {
			data.sameLevelForums = data.level1Forums;
		} else {
			const parentForum = data.breadcrumbForums[data.breadcrumbForums.length - 1];
			data.sameLevelForums = await db.ForumModel.find({parentId: parentForum.fid}).sort({order: 1});
		}
		data.childrenForums = await db.ForumModel.find({parentId: data.forum.fid}).sort({order: 1});
		await next();
	})
	.get('/', async (ctx) => {
		const fid = ctx.params.fid;
		return ctx.redirect(`/f/${fid}/settings/info`);
	})
	.use('/image', imageRouter.routes(), imageRouter.allowedMethods())
	.use('/permission', permissionRouter.routes(), permissionRouter.allowedMethods())
	.use('/category', categoryRouter.routes(), categoryRouter.allowedMethods())
	.use('/info', infoRouter.routes(), infoRouter.allowedMethods());
module.exports = settingsRouter;