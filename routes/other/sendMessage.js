const Router = require('koa-router');
const sendMessageRouter = new Router();
sendMessageRouter
	.post('/login', async (ctx, next) => {
		const {db, body} = ctx;
		const {nationCode, mobile, imgCode} = body;
		if(!imgCode) ctx.throw(400, '图形验证码不能为空');
		if(!nationCode) ctx.throw(400, '国际区号不能为空');
		if(!mobile) ctx.throw(400, '手机号不能为空');
    const imgCodeId = ctx.cookies.get('imgCodeId', {signed: true});
    await db.ImgCodeModel.ensureCode(imgCodeId, imgCode);
		const otherPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
		if(!otherPersonal) ctx.throw(400, '暂未有用户绑定该手机号');
		const smsCodeObj = {
			nationCode,
			mobile,
			type: 'login',
			ip: ctx.address
		};
		await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
		const {apiFunction, sendMessage} = ctx.nkcModules;
		smsCodeObj.code = apiFunction.random(6);
		const smsCode = db.SmsCodeModel(smsCodeObj);
		await smsCode.save();
		await sendMessage(smsCodeObj);
		await next();
	})
  .post('/register', async (ctx, next) => { // 手机号码注册
  	const {db, body} = ctx;
  	const {nationCode, mobile, imgCode} = body;
    if(!imgCode) ctx.throw(400, '图形验证码不能为空');
  	if(!nationCode) ctx.throw(400, '国际区号不能为空');
  	if(!mobile) ctx.throw(400, '手机号不能为空');
    const imgCodeId = ctx.cookies.get('imgCodeId', {signed: true});
    await db.ImgCodeModel.ensureCode(imgCodeId, imgCode);
  	const otherPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
  	if(otherPersonal) ctx.throw(400, '手机号已被其他用户注册');
  	const smsCodeObj = {
  		nationCode,
		  mobile,
		  type: 'register',
		  ip: ctx.address
	  };
  	await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
  	const {apiFunction, sendMessage} = ctx.nkcModules;
  	smsCodeObj.code = apiFunction.random(6);
  	const smsCode = db.SmsCodeModel(smsCodeObj);
  	await smsCode.save();
  	await sendMessage(smsCodeObj);
  	await next();


  	/*const {db, body} = ctx;
		const {nationCode, username, mobile, imgCode} = body;
	  if(!username) ctx.throw(400, '请输入用户名。');
	  const {contentLength} = ctx.tools.checkString;
	  if(contentLength(username) > 30) ctx.throw(400, '用户名不能大于30字节(ASCII)。');
	  const otherUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	  if(otherUser) ctx.throw(400, '用户名已被注册。');
		if(!nationCode) ctx.throw(400, '请输入国际区号。');
		if(!mobile) ctx.throw(400, '请输入手机号码。');
		const otherPersonal = await db.UsersPersonalModel.findOne({nationCode, mobile});
		if(otherPersonal) ctx.throw(400, `手机号码已被其他账号注册。`);
		if(!imgCode) ctx.throw(400, '请输入图片验证码。');
		const id = ctx.cookies.get('imgCodeId');
		await db.ImgCodeModel.ensureCode(id, imgCode);
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
		await next();*/
  })
  .post('/getback', async (ctx, next) => { // 找回密码
  	const {db, body} = ctx;
  	const {username, mobile} = body;
    const nationCode = body.nationCode.toString();
  	if(!username) ctx.throw(400, '请输入用户名。');
	  const user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
	  if(!user) ctx.throw(400, '用户名不存在。');
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(!userPersonal.mobile) ctx.throw(400, '此账号未绑定手机号码。');
	  if(!nationCode) ctx.throw(400, '请输入国际区号。');
	  if(!mobile) ctx.throw(400, '请输入手机号码。');
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
  })
	.post('/changeMobile', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		const {operation} = body;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(!userPersonal.mobile) ctx.throw(400, '您暂未绑定手机号，请刷新');
		const {apiFunction, sendMessage} = ctx.nkcModules;
		let smsCodeObj = {};
		if(operation === 'verifyOldMobile') { //-- 验证旧手机 --
			const type = 'changeMobile';
			const ip = ctx.address;
			smsCodeObj = {
				nationCode: userPersonal.nationCode,
				mobile: userPersonal.mobile,
				type,
				ip
			};
			await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
			smsCodeObj.code = apiFunction.random(6);
		} else if(operation === 'verifyNewMobile') { //-- 验证新手机 --
			const {nationCode, mobile} = body;
			if(!mobile) ctx.throw(400, '新手机号不能为空');
			if(userPersonal.mobile === mobile && userPersonal.nationCode === nationCode) ctx.throw(400, '您已绑定该手机号，请更换后重试');
			const sameUserPersonal = await db.UsersPersonalModel.findOne({mobile, nationCode});
			if(sameUserPersonal) ctx.throw(400, '该号码已被其他用户绑定，请更换后重试');
			const type = 'bindMobile';
			const ip = ctx.address;
			smsCodeObj = {
				nationCode,
				mobile,
				type,
				ip
			};
			await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
			smsCodeObj.code = apiFunction.random(6);
		} else {
			ctx.throw(400, '未知的操作类型');
		}
		const smsCode = db.SmsCodeModel(smsCodeObj);
		await smsCode.save();
		await sendMessage(smsCodeObj);
		await next();
	})
  .post("/withdraw", async (ctx, next) => {
    const {nkcModules, db, data} = ctx;
    const {user} = data;
    if(user.authLevel < 1) ctx.throw(400, "请先绑定手机号");
    const usersPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    const {nationCode, mobile} = usersPersonal;
    const smsCodeObj = {
      nationCode,
      mobile,
      type: "withdraw",
      ip: ctx.address
    };
    await db.SmsCodeModel.ensureSendPermission(smsCodeObj);
    smsCodeObj.code = nkcModules.apiFunction.random(6);
    const smsCode = db.SmsCodeModel(smsCodeObj);
    await smsCode.save();
    await nkcModules.sendMessage(smsCodeObj);
    await next();
  });
module.exports = sendMessageRouter;