const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.KCBSettings = (await db.SettingModel.findOne({_id: 'kcb'})).c;
		data.modifyUsernameOperation = await db.KcbsTypeModel.findOnly({_id: 'modifyUsername'});
		ctx.template = 'interface_user_settings_info.pug';
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, body} = ctx;
		const {user} = data;
		let {description, postSign, color, operation} = body;
		const {contentLength} = ctx.tools.checkString;
		if(description) {
			if(contentLength(description) > 500) ctx.throw(400, '个人简介不能超过250个字。');
			user.description = description;
		}
		if(postSign) {
			if(contentLength(postSign) > 1000) ctx.throw(400, '帖子签名不能超过500个字。');
			user.postSign = postSign;
		}
		if(color) {
			if(color.length > 10) ctx.throw(400, '背景颜色错误');
			user.color = color;
		}
		//适应搜索数据库，用save方法更新user信息
		await user.save();
		await next();
	});
module.exports = infoRouter;