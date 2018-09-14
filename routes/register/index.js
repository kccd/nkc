const Router = require('koa-router');
const registerRouter = new Router();
const captcha = require('trek-captcha');
registerRouter
  .get(['/','/mobile'], async (ctx, next) => {
  	const {data, query} = ctx;
  	const {user} = data;
  	if(user && user.username) ctx.throw(403, '您已注册成功并且设置过用户名和密码');
		const {code} = query;
		if(code) {
			data.regCode = code;
		}
		data.getCode = false;
		ctx.template = 'register/register.pug';
	  const lastUrl = ctx.req.headers['referer'];
	  if(!lastUrl || !lastUrl.includes('register')) {
		  ctx.cookies.set('lastUrl', lastUrl, {
			  signed: true,
			  maxAge: ctx.settings.cookie.life,
			  httpOnly: true
		  });
	  }
		await next();
  })
  .post('/', async (ctx, next) => { // 手机注册
	  const {db, data, body, tools} = ctx;
	  let user;
	  const {mobile, nationCode, code, imgCode} = body;
	  if(!nationCode) ctx.throw(400, '请选择国家区号');
	  if(!mobile) ctx.throw(400, '请输入手机号');
    if(!imgCode) ctx.throw(400, '请输入验证码');
	  if(!code) ctx.throw(400, '请输入验证码');

    const imgCodeId = ctx.cookies.get('imgCodeId', {signed: true});

    const imgCodeObj = await db.ImgCodeModel.ensureCode(imgCodeId, imgCode);

    ctx.cookies.set('imgCodeId', '', {
      httpOnly: true,
      signed: true
    });

    await imgCodeObj.update({used: true});

	  const userPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
	  if(userPersonal) ctx.throw(400, '手机号码已被其他用户注册。');

	  const option = {
		  type: 'register',
		  mobile,
		  code,
		  nationCode
	  };
	  const smsCode = await db.SmsCodeModel.ensureCode(option);
	  await smsCode.update({used: true});
	  option.regIP = ctx.address;
	  option.regPort = ctx.port;
	  delete option.type;
	  user = await db.UserModel.createUser(option);

    await imgCodeObj.update({uid: user.uid});

	  const cookieStr = encodeURI(JSON.stringify({
		  uid: user.uid,
		  username: user.username,
		  lastLogin: Date.now()
	  }));
	  ctx.cookies.set('userInfo', cookieStr, {
		  signed: true,
		  maxAge: ctx.settings.cookie.life,
		  httpOnly: true
	  });
	  ctx.data = {
		  cookie: ctx.cookies.get('userInfo'),
		  introduction: 'put the cookie in req-header when using for api',
		  user
	  };
	  const forumSettings = await db.SettingModel.findOnly({type: 'forum'});
	  const {defaultForumsId=[]} = forumSettings;
	  if(defaultForumsId.length !== 0) {
		  for(const fid of defaultForumsId) {
			  const forum = await db.ForumModel.findOne({fid});
			  if(!forum) continue;
			  await forum.update({$addToSet: {followersId: user.uid}});
		  }
	  }
	  await db.UsersSubscribeModel.update({uid: user.uid}, {$set: {subscribeForums: defaultForumsId}});
	  const personal = await db.UsersPersonalModel.findOnly({uid: user.uid});
	  data.loginKey = await tools.encryption.aesEncode(user.uid, personal.password.hash);
	  await next();
  })
	.post('/information', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		const {username, password} = body;
		if(user.username) ctx.throw(403, '您已设置过用户名和密码。');
		if(!username) ctx.throw(400, '用户名不能为空。');
		const {contentLength, checkPass} = ctx.tools.checkString;
		if(contentLength(username) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
		const pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
		if(pattern.test(username)) ctx.throw(400, '用户名含有非法字符！')
		const targetUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
		if(targetUser) ctx.throw(400, '用户名已被注册。');
		if(!password) ctx.throw(400, '请输入密码。');
		if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位。');
		if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
		const {newPasswordObject} = ctx.nkcModules.apiFunction;
		const passwordObj = newPasswordObject(password);
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		await user.update({username, usernameLowerCase: username.toLowerCase()});
		await userPersonal.update({hashType: passwordObj.hashType, password: passwordObj.password});
		await db.PersonalForumModel.update({uid: user.uid}, {$set: {
			abbr: username.slice(0.6),
			displayName: username + '的专栏',
			descriptionOfForum: username + '的专栏'
		}});
		user.username = username;
		const userInfo = ctx.cookies.get('userInfo');
		const {lastLogin} = JSON.parse(decodeURI(userInfo));
		const cookieStr = encodeURI(JSON.stringify({
			uid: user.uid,
			username: user.username,
			lastLogin
		}));
		ctx.cookies.set('userInfo', cookieStr, {
			signed: true,
			maxAge: ctx.settings.cookie.life,
			httpOnly: true
		});
		data.cookie = ctx.cookies.get('userInfo');
		await next();
	})
	.get('/code', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		if(user) ctx.throw(400, '您已注册，无法获取图片验证码。');
		const {token, buffer} = await captcha();
		const imgCode = db.ImgCodeModel({
			token
		});
		await imgCode.save();
		ctx.cookies.set('imgCodeId', imgCode._id, {
			signed: true,
			maxAge: ctx.settings.cookie.life,
			httpOnly: true
		});
		ctx.logIt = true;
		ctx.status = ctx.response.status;
		const passed = Date.now() - ctx.reqTime;
		ctx.set('X-Response-Time', passed);
		ctx.processTime = passed.toString();
		return ctx.body = buffer;
	});
  /*.get('/email', async (ctx, next) => {
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
	  if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位。');
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
	  const answerSheet = await db.AnswerSheetModel.findOne({key: emailRegister.regCode});
	  if(!answerSheet) ctx.throw(500, '抱歉！数据出错，请与管理员联系。');
	  if(answerSheet.uid) ctx.throw(400, '注册码已失效，请重新参加考试。');
		const newUser = await db.UserModel.createUser(userObj);
		answerSheet.uid = newUser.uid;
		await answerSheet.save();
		data.activeInfo1 = `邮箱注册成功，赶紧登录吧~`;
		ctx.template = 'interface_user_login.pug';
		await next();
  });*/
module.exports = registerRouter;