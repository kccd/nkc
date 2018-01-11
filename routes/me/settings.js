const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
	.get('/', async (ctx, next) => {
		const {query, data, db} = ctx;
		const {user} = data;
		const {type} = query;
		data.type = type;
		ctx.template = 'interface_user_settings.pug';
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(type === 'idPhoto') {
			data.privateInfo = userPersonal.privateInfo;
		} else if(type === 'account') {
			const {mobile, email} = userPersonal;
			data.userPersonal = {
				mobile,
				email
			}
		} else {

		}
		await next();
	})
	.patch('/', async (ctx, next) => {
		const db = ctx.db;
		const params = ctx.body;
		const user = ctx.data.user;
		user.postSign = params.post_sign.toString().trim();
		user.description = params.description.toString().trim();
		user.color = params.color.toString().trim();
		let subscribeForums = params.focus_forums.toString().trim() || '';
		subscribeForums = subscribeForums.split(',');
		const relFid = [];
		for (let fid of subscribeForums) {
			const forum = await db.ForumModel.findOne({fid});
			if(forum && !relFid.includes(fid)) relFid.push(fid);
		}
		if(user.postSign.length>300||user.description.length>300||user.color.length>10) {
			ctx.throw(400, '提交的内容字数超出限制，请检查');
		}
		await user.update({postSign: user.postSign, description: user.description, color: user.color});
		// await user.save();
		await db.UsersSubscribeModel.replaceOne({uid: user.uid},{$set:{subscribeForums: relFid}});
		await next();
	});
module.exports = settingsRouter;