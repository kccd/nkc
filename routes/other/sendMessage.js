const Router = require('koa-router');
const sendMessageRouter = new Router();
sendMessageRouter
  .post('/register', async (ctx, next) => { // 手机号码注册
  	const {db, body} = ctx;
		const {regCode, nationCode, username, mobile} = body;
		if(!regCode) ctx.throw(400, '请输入注册码。');
	  await db.AnswerSheetModel.ensureAnswerSheet(regCode);
	  if(!username) ctx.throw(400, '请输入用户名。');
	  const {contentLength} = ctx.tools.checkString;
	  if(contentLength(username) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
	  const otherUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	  if(otherUser) ctx.throw(400, '用户名已被注册。');
		if(!nationCode) ctx.throw(400, '请输入国际区号。');
		if(!mobile) ctx.throw(400, '请输入手机号码。');
		const otherPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
		if(otherPersonal) ctx.throw(400, `手机号码已被其他账号注册。`);
		const type = 'register';
		const ip = ctx.address;
		const smsCodeObj = {
			nationCode,
			mobile,
			type,
			ip
		};
		await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
		const {apiFunction, sendMessage} = ctx.nkcModules;
	  smsCodeObj.code = apiFunction.random(6);
		const smsCode = db.SmsCodeModel(smsCodeObj);
	  await smsCode.save();
		await sendMessage(smsCodeObj);
		await next();
  })
  .post('/getback', async (ctx, next) => { // 找回密码
  	const {db, body} = ctx;
  	const {username, mobile, nationCode} = body;
  	if(!username) ctx.throw(400, '请输入用户名。');
	  const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	  if(!user) ctx.throw(400, '用户名不存在。');
  	if(!nationCode) ctx.throw(400, '请输入国际区号。');
  	if(!mobile) ctx.throw(400, '请输入手机号码。');
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(!userPersonal.mobile) ctx.throw(400, '此账号未绑定手机号码。');
		if(userPersonal.mobile !== mobile || userPersonal.nationCode !== nationCode) {
			ctx.throw(400, '账号与手机号码无法对应。');
		}
		const type = 'getback';
		const ip = ctx.address;
		const smsCodeObj = {
			mobile,
			nationCode,
			type,
			ip
		};
		await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
		const {sendMessage, apiFunction} = ctx.nkcModules;
		smsCodeObj.code = apiFunction.random(6);
		const smsCode = db.SmsCodeModel(smsCodeObj);
		await smsCode.save();
		await sendMessage(smsCodeObj);
		await next();
  })
  .post('/bindMobile', async (ctx, next) => { // 绑定手机号码
  	const {data, db, body} = ctx;
  	const {user} = data;
  	const {mobile, nationCode} = body;
  	const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
  	if(userPersonal.mobile && userPersonal.nationCode) {
  		ctx.throw(400, `您的账号已绑定手机号码：+${userPersonal.nationCode} ${userPersonal.mobile}`);
	  }
	  if(!mobile) ctx.throw(400, '请输入要绑定的手机号码。');
  	if(!nationCode) ctx.throw(400, '请选择国际区号。');
  	const otherPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
  	if(otherPersonal) {
  		ctx.throw(400, `手机号码已被其他账号绑定。`);
	  }
	  const type = 'bindMobile';
  	const ip = ctx.address;
  	const smsCodeObj = {
			nationCode,
		  mobile,
		  type,
		  ip
	  };
		await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
		const {apiFunction, sendMessage} = ctx.nkcModules;
		smsCodeObj.code = apiFunction.random(6);
  	const smsCode = db.SmsCodeModel(smsCodeObj);
		await smsCode.save();
		await sendMessage(smsCodeObj);
		await next();
  });
module.exports = sendMessageRouter;