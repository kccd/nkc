const Router = require('koa-router');
const passwordRouter = new Router();
passwordRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_user_settings_password.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {oldPassword = "", password = ""} = body;
		const {apiFunction} = ctx.nkcModules;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    if(!password) ctx.throw(400, '新密码不能为空');
		// 如果之前设置过密码，当再次修改密码时需验证旧密码
		if(userPersonal.password.hash || userPersonal.password.salt) {
      if(!oldPassword) ctx.throw(400, '旧密码不能为空');
      if(!apiFunction.testPassword(oldPassword, userPersonal.hashType, userPersonal.password)) {
        ctx.throw(400, '旧密码错误');
      }
    }
		const {contentLength, checkPass} = ctx.tools.checkString;
		if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位');
		if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者');
		const newPassword = apiFunction.newPasswordObject(password);
		const behavior = {
			uid: user.uid,
			ip: ctx.address,
			port: ctx.port,
			type: "modifyPassword",
			oldHashType: userPersonal.hashType,
			oldHash: userPersonal.password.hash,
			oldSalt: userPersonal.password.salt,
			newHashType: newPassword.hashType,
			newHash: newPassword.password.hash,
			newSalt: newPassword.password.salt
		};
		await userPersonal.updateOne({
			password: newPassword.password,
			secret: newPassword.secret,
			hashType: newPassword.hashType
		});
		await db.SecretBehaviorModel(behavior).save();
		ctx.setCookie("userInfo", {
			uid: user.uid,
			username: user.username,
			lastLogin: newPassword.secret
		});
		// 兼容app，修改app时去掉
		data.loginKey = "";
		await next();
	});
module.exports = passwordRouter;
