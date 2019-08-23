const Router = require('koa-router');
const infoRouter = new Router();
infoRouter
	.patch('info', async (ctx, next) => {
		const {data, body, nkcModules} = ctx;
		const {user} = data;
		let {description, postSign} = body;
		const {contentLength} = ctx.tools.checkString;
    if(contentLength(description) > 500) ctx.throw(400, '个人简介不能超过250个字。');
    user.description = description;
    if(contentLength(postSign) > 1000) ctx.throw(400, '文章签名不能超过500个字。');
    user.postSign = postSign;
		//适应搜索数据库，用save方法更新user信息
		await user.save();
    await nkcModules.elasticSearch.save("user", user);
		await next();
	});
module.exports = infoRouter;