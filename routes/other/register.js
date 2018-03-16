const Router = require('koa-router');
const registerRouter = new Router();
registerRouter
  .get(['/','/mobile'], async (ctx, next) => {
  	const {data, query} = ctx;
		const {code} = query;
		if(code) {
			data.regCode = code;
		}
		data.getCode = false;
		ctx.template = 'interface_user_register.pug';
		await next();
  })
  .post('/mobile', async (ctx, next) => { // 手机注册
	  const {db, body} = ctx;
		const {username, password, regCode, mobile, mcode, nationCode} = body;
		const regIP = ctx.address;
		const regPort = ctx.port;
		if(!regCode) ctx.throw(400, '请输入注册码。');
		const answerSheet = await db.AnswerSheetModel.ensureAnswerSheet(regCode);
		const isA = answerSheet.isA;
		if(!username) ctx.throw(400, '请输入用户名。');
	  const {contentLength, checkPass} = ctx.tools.checkString;
	  if(contentLength(username) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
		const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
		if(user) ctx.throw(400, '用户名已被注册。');
		if(!password) ctx.throw(400, '请输入密码。');
		if(contentLength(password) <= 8) ctx.throw(400, '密码长度至少要大于8位。');
		if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
		if(!nationCode) ctx.throw(400, '请输入国际区号。');
		if(!nationCode) ctx.throw(400, '请输入手机号码。');
		const userPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
		if(userPersonal) ctx.throw(400, '手机号码已被其他账号注册。');
		const type = 'register';
		const smsCodeObj = {
			nationCode,
			mobile,
			type,
			code: mcode
		};
		const smsCode = await db.SmsCodeModel.ensureCode(smsCodeObj);
		const userObj = {
			username,
			password,
			mobile,
			nationCode,
			regIP,
			regPort,
			isA
		};
		const newUser = await db.UserModel.createUser(userObj);
	  smsCode.used = true;
	  await smsCode.save();
		answerSheet.uid = newUser.uid;
		await answerSheet.save();
		await next();
  })
  .get('/email', async (ctx, next) => {
  	const {data, query} = ctx;
  	const {code} = query;
    if(code) {
      data.regCode = code;
    }
    ctx.template = 'interface_user_register2.pug';
    await next();
  })
  .post('/email', async (ctx, next) => { // 邮箱注册
	  const {db, body} = ctx;
	  const {username, password, regCode, email} = body;
	  const regIP = ctx.address;
	  const regPort = ctx.port;
	  if(!regCode) ctx.throw(400, '请输入注册码。');
	  const answerSheet = await db.AnswerSheetModel.ensureAnswerSheet(regCode);
	  const isA = answerSheet.isA;
	  if(!username) ctx.throw(400, '请输入用户名。');
	  const {contentLength, checkPass, checkEmailFormat} = ctx.tools.checkString;
	  if(contentLength(username) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
	  const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	  if(user) ctx.throw(400, '用户名已被注册。');
	  if(!email) ctx.throw(400, '请输入邮箱。');
	  if(checkEmailFormat(email) === -1) ctx.throw(400, '邮箱格式不正确。');
	  const userPersonal = await db.UsersPersonalModel.findOne({email});
	  if(userPersonal) ctx.throw(400, '此邮箱已被其他用户注册。');
	  await db.EmailRegisterModel.ensureSendPermission(email);
	  if(!password) ctx.throw(400, '请输入密码。');
	  if(contentLength(password) <= 8) ctx.throw(400, '密码长度至少要大于8位。');
	  if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
	  const {apiFunction, sendEmail} = ctx.nkcModules;
	  const ecode = apiFunction.random(14);
	  const passwordObj = apiFunction.newPasswordObject(password);
	  const userObj = {
	  	username,
		  email,
		  regIP,
		  regPort,
		  regCode,
		  ecode,
		  isA,
		  password: passwordObj.password,
		  hashType: passwordObj.hashType
	  };
	  const emailRegister = db.EmailRegisterModel(userObj);
	  await emailRegister.save();
	  const text = `欢迎注册科创论坛，点击以下链接就可以激活您的账号：`;
	  const href = `https://www.kechuang.org/register/email/verify?email=${email}&ecode=${ecode}`;
	  const link = `<a href="${href}">${href}</a>`;
	  await sendEmail({
		  to: email,
		  subject: `注册账户`,
		  text: text + href,
		  html: text + link
	  });
	  await next();
  })
  .get('/email/verify', async (ctx, next) => {
  	const {data, query, db} = ctx;
  	const {email, ecode} = query;
	  const userPersonal = await db.UsersPersonalModel.findOne({email});
	  if(userPersonal) ctx.throw(400, '此邮箱已被其他用户注册。');
	  const {emailCodeTime} = ctx.settings.sendMessage;
	  const emailRegister = await db.EmailRegisterModel.findOne({email, ecode, toc: {$gt: (Date.now() - emailCodeTime)}, used: false});
	  if(!emailRegister) ctx.throw(400, '邮箱链接已失效，请重新注册。');
	  emailRegister.used = true;
	  await emailRegister.save();
	  const userObj = emailRegister.toObject();
		delete userObj._id;
	  const answerSheet = await db.AnswerSheetModel.findOne({key: emailRegister.regCode, uid: ''});
		const newUser = await db.UserModel.createUser(userObj);
		answerSheet.uid = newUser.uid;
		await answerSheet.save();
		data.activeInfo1 = `邮箱注册成功，赶紧登陆吧~`;
		ctx.template = 'interface_user_login.pug';
		await next();
  });
module.exports = registerRouter;