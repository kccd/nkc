const Router = require('koa-router');
const forgotPasswordRouter = new Router();
forgotPasswordRouter
	.use('/', async (ctx, next) => {
		const {nkcModules} = ctx;
		const {user} = ctx.data;
		if(user) {
			return ctx.redirect('/');
		}
		await next();
	})
  // 手机找回密码页面
.get(['/mobile', '/'], async (ctx, next) => {
	const {data, query} = ctx;
	const {mobile, mcode, nationCode} = query;
	data.mobile = mobile;
	data.mcode = mcode;
	data.nationCode = nationCode;
	ctx.template = 'interface_viewForgotPassword2.pug';
	await next();
})
.post('/mobile', async (ctx, next) => {
	const {data, db, body} = ctx;
	const {username, mcode, mobile, nationCode} = body;
	if(!username) ctx.throw(400, '请输入用户名。');
	const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	if(!user) ctx.throw(400, '用户名不存在。');
	const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
	if(!userPersonal.mobile) ctx.throw(400, '此账号未绑定手机号码。');
	if(!nationCode) ctx.throw(400, '请输入国际区号。');
	if(!mobile) ctx.throw(400, '请输入手机号码。');
	if(nationCode !== userPersonal.nationCode || mobile !== userPersonal.mobile) {
		ctx.throw(400, '账号与手机号码无法对应。');
	}
	if(!mcode) ctx.throw(400, '请输入短信验证码。');
	const type = 'getback';
	await db.SmsCodeModel.ensureCode({nationCode, mobile, type, code: mcode});
	data.mobile = mobile;
	data.mcode = mcode;
	data.nationCode = nationCode;
	await next();
})
.put('/mobile', async (ctx, next) => {
	const {db, body} = ctx;
	const {password, mcode, mobile, nationCode} = body;
	if(!mobile || !nationCode || !mcode) ctx.throw(400, '参数错误，请刷新页面后重新提交。');
	const type = 'getback';
	const smsCode = await db.SmsCodeModel.ensureCode({nationCode, mobile, code: mcode, type});
	if(!password) ctx.throw(400, '请输入密码。');
	const {contentLength, checkPass} = ctx.tools.checkString;
	if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位。');
	if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
	const {apiFunction} = ctx.nkcModules;
	const passwordObj = apiFunction.newPasswordObject(password);
	const userPersonal = await db.UsersPersonalModel.findOnly({mobile, nationCode});
	userPersonal.password = passwordObj.password;
	userPersonal.hashType = passwordObj.hashType;
	smsCode.used = true;
	await userPersonal.save();
	await smsCode.save();
	await next();
})
.get('/email', async (ctx, next) => {
	const {db, data, query} = ctx;
	const {sent, email, token} = query;
	if(email && token) {
		const type = 'getback';
		await db.EmailCodeModel.ensureEmailCode({email, token, type});
	}
	data.sent = sent;
	data.token = token;
	data.email = email;
	ctx.template = 'interface_viewForgotPassword.pug';
	await next();
})
.post('/email', async (ctx, next) => {
	const {db, body} = ctx;
	const {username, email} = body;
	if(!username) ctx.throw(400, '请输入用户名。');
	const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	if(!user) ctx.throw(400, '用户名不存在。');
	const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
	if(!userPersonal.email) ctx.throw(400, '账号未绑定邮箱，请通过其他方式找回密码。');
	if(email !== userPersonal.email) ctx.throw(400, '账号与邮箱地址无法对应。');
	const type = 'getback';
	await db.EmailCodeModel.ensureSendPermission({email, type});
	const token = Math.floor((Math.random()*(65536*65536))).toString(16);
	const emailCode = db.EmailCodeModel({
		email,
		token,
		type,
		uid: user.uid
	});
	await emailCode.save();
	const text = `有人在 ${(new Date()).toLocaleString()} 请求重置账户密码。如果不是你的操作，请忽略。`;
	const href = `https://www.kechuang.org/forgotPassword/email?email=${email}&token=${token}`;
	const link = `<a href="${href}">${href}</a>`;
	const {sendEmail} = ctx.nkcModules;
	await sendEmail({
		to: email,
		subject: `请求重置密码`,
		text: text + href,
		html: text + link
	});
	await next();
})
.put('/email', async (ctx, next) => {
	const {db, body} = ctx;
	const {email, password, password2, token} = body;
	if(!email || !token) ctx.throw(400, '参数错误，请刷新页面后重新提交。');
	const type = 'getback';
	const emailCode = await db.EmailCodeModel.ensureEmailCode({
		type,
		email,
		token
	});
	if(!password) ctx.throw(400, '请输入密码。');
	if(password !== password2) ctx.throw(400, '两次输入的密码不一致，请重新输入。');
	const {checkPass, contentLength} = ctx.tools.checkString;
	if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位。');
	if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
	const {apiFunction} = ctx.nkcModules;
	const passwordObj = apiFunction.newPasswordObject(password);
	const userPersonal = await db.UsersPersonalModel.findOne({email});
	if(!userPersonal) ctx.throw(400, '邮箱未注册');
	userPersonal.password = passwordObj.password;
	userPersonal.hashType = passwordObj.hashType;
	emailCode.used = true;
	await userPersonal.save();
	await emailCode.save();
	await next();
});
module.exports = forgotPasswordRouter;
