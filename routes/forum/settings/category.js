const Router = require('koa-router');
const categoryRouter = new Router();
categoryRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const {forum} = data;
		const parentForums = [];
		let f = forum;
		while(1) {
			if(f.parentId) {
				f = await db.ForumModel.findOnly({fid: f.parentId});
				parentForums.unshift(f);
			} else {
				break;
			}
		}
		data.parentForums = parentForums;
		ctx.template = 'interface_forum_settings_category.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {forum} = data;
		const {operation} = body;
		if(operation === 'savePosition') {
			const {parentId} = body;
			if(parentId === forum.fid) ctx.throw(400, '板块不能成为自己的子版块');
			if(!parentId) {
				await forum.update({parentId: ''});
			} else {
				const targetForum = await db.ForumModel.findOnly({fid: parentId});
				await forum.update({parentId});
			}
		} else if(operation === 'saveOrder') {
			const {childrenFid} = body;
			for(let i = 0; i < childrenFid.length; i++) {
				const fid = childrenFid[i];
				const childrenForum = await db.ForumModel.findOnly({fid});
				await childrenForum.update({order: i});
			}
		}
		await next();
	});
module.exports = categoryRouter;