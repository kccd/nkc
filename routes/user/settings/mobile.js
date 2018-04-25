const Router = require('koa-router');
const mobileRouter = new Router();
mobileRouter
	.get('/', async (ctx, next) => {
		ctx.template = 'interface_user_settings_mobile.pug';
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.mobile = userPersonal.mobile;
		data.nationCode = userPersonal.nationCode;
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		let {mobile, code, oldCode, nationCode} = body;
		if(!oldCode) ctx.throw(400, '旧手机验证码不能为空');
		if(!nationCode) ctx.throw(400, '新手机国际区号不能为空');
		if(!mobile) ctx.throw(400, '新手机号码不能为空');
		if(!code) ctx.throw(400, '新手机验证码不能为空');
		mobile = mobile.trim();
		code = code.trim();
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		let smsCodeOld, smsCode;
		try {
			smsCodeOld = await db.SmsCodeModel.ensureCode({
				mobile: userPersonal.mobile,
				nationCode: userPersonal.nationCode,
				code: oldCode,
				type: 'changeMobile'
			});
		} catch(err) {
			ctx.throw(400, `旧手机${err.message}`);
		}
		try {
			smsCode = await db.SmsCodeModel.ensureCode({
				mobile,
				nationCode,
				code,
				type: 'bindMobile'
			});
		} catch(err) {
			ctx.throw(400, `新手机${err.message}`);
		}
		await smsCodeOld.update({used: true});
		await smsCode.update({used: true});
		const newSecretBehavior = db.SecretBehaviorModel({
			uid: user.uid,
			type: 'changeMobile',
			ip: ctx.address,
			port: ctx.port,
			oldMobile: userPersonal.mobile,
			oldNationCode: userPersonal.nationCode,
			newMobile: mobile,
			newNationCode: nationCode
		});
		await userPersonal.update({nationCode, mobile});
		await newSecretBehavior.save();
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		let {mobile, code, nationCode} = body;
		if(!mobile) ctx.throw(400, '手机号码不能为空');
		if(!code) ctx.throw(400, '手机验证码不能为空');
		if(!nationCode) ctx.throw(400, '国际区号不能为空');
		mobile = mobile.trim();
		code = code.trim();
		const smsCode = await db.SmsCodeModel.ensureCode({
			mobile,
			code,
			nationCode,
			type: 'bindMobile'
		});
		await smsCode.update({used: true});
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const newSecretBehavior = db.SecretBehaviorModel({
			uid: user.uid,
			type: 'bindMobile',
			ip: ctx.address,
			port: ctx.port,
			mobile,
			nationCode
		});
		await userPersonal.update({nationCode, mobile});
		await newSecretBehavior.save();
		await next();
	});
module.exports = mobileRouter;