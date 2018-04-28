const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_forum_settings_info.pug';

		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {forum} = data;
		const {displayName, abbr, color, description, declare} = body;
		if(!displayName) ctx.throw(400, '板块名称不能为空');
		const sameDisplayNameForum = await db.ForumModel.findOne({displayName});
		if(sameDisplayNameForum.fid !== forum.fid) ctx.throw(400, '板块名称已存在');
		if(!abbr) ctx.throw(400, '板块简称不能为空');
		const sameAbbrForum = await db.ForumModel.findOne({abbr});
		if(sameAbbrForum.fid !== forum.fid) ctx.throw(400, '板块简称已存在');
		if(!description) ctx.throw(400, '板块介绍不能为空');
		if(!declare) ctx.throw(400, '板块说明不能为空');
		await forum.update({displayName, abbr, color, description, declare});
		await next();
	});
module.exports = infoRouter;
