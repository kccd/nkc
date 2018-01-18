const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const userPersonalArr = await db.UsersPersonalModel.find({submittedAuth: true}).sort({toc: 1});
		data.usersAuth = await Promise.all(userPersonalArr.map(async u => {
			const authLevel = await u.getAuthLevel();
			const idCardPhotos = await u.extendIdPhotos();
			const user = await db.UserModel.findOnly({uid: u.uid});
			return {
				idCardPhotos,
				authLevel,
				user
			}
		}));
		data.type = 'list';
		ctx.template = 'interface_auth.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		const {number} = body;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const authLevel = await userPersonal.getAuthLevel();
		if(userPersonal.submittedAuth) ctx.throw(400, `您已提交 “身份认证${authLevel+1}” 的申请，请耐心等待！`);
		if(authLevel !== (number - 1)) ctx.throw(400, `请先通过 “身份认证${authLevel+1}” ！`);
		await userPersonal.update({submittedAuth: true});
		await next();
	})
	.get('/:uid', async(ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		if(!targetUserPersonal.submittedAuth) {
			data.error = '该申请已被用户撤回！';
		} else {
			data.targetUser = targetUser;
			data.authLevel = await targetUserPersonal.getAuthLevel();
			data.idCardPhotos = await targetUserPersonal.extendIdPhotos();
		}
		ctx.template = 'interface_auth.pug';
		await next();
	})
	.del('/:uid', async (ctx, next) => {
		const {data, db, query, params} = ctx;
		const {uid} = params;
		const {number} = query;
		console.log(number);
		const {user, userLevel} = data;
		if(user.uid !== uid && userLevel < 7) ctx.throw(401, '权限不足');
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const authLevel = await userPersonal.getAuthLevel();
		if(!userPersonal.submittedAuth) ctx.throw(400, `暂未有已提交的申请。`);
		if(authLevel !== (number - 1)) ctx.throw(400, `参数不正确，您只完成了身份认证${authLevel},无法进行身份认证${number}的操作！`);
		await userPersonal.update({submittedAuth: false});
		await next();
	});
module.exports = authRouter;