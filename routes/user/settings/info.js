const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.KCBSettings = await db.SettingModel.findOne({type: 'kcb'});
		data.modifyUsernameOperation = await db.TypesOfScoreChangeModel.findOnly({_id: 'modifyUsername'});
		ctx.template = 'interface_user_settings_info.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {user} = data;
		let {description, postSign, color} = body;
		const {contentLength} = ctx.tools.checkString;
		if(contentLength(description) > 500) ctx.throw(400, '个人简介不能超过250个字。');
		if(contentLength(postSign) > 1000) ctx.throw(400, '帖子签名不能超过500个字。');
		if(color.length > 10) ctx.throw(400, '背景颜色错误');
		color = color.trim();
		const q = {
			description,
			postSign,
			color
		};
		//适应搜索数据库，用save方法更新user信息
		user.description = q.description;
		user.color = q.color;
		user.postSign = q.postSign;
		await user.save();
		await next();
	});
module.exports = infoRouter;