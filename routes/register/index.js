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
		await next();
  })
  .post('/', async (ctx, next) => { // 手机注册
	  const {db, data, body, tools} = ctx;
	  let user;
	  const {mobile, nationCode, code, imgCode} = body;
	  if(!nationCode) ctx.throw(400, '请选择国家区号');
	  if(!mobile) ctx.throw(400, '请输入手机号');
    if(!imgCode) ctx.throw(400, '请输入图形验证码');
	  if(!code) ctx.throw(400, '请输入短信验证码');

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
	  let forumSettings = await db.SettingModel.findOnly({_id: 'forum'});
	  forumSettings = forumSettings.c;
	  const {defaultForumsId=[]} = forumSettings;
	  if(defaultForumsId.length !== 0) {
		  for(const fid of defaultForumsId) {
			  const forum = await db.ForumModel.findOne({fid});
			  if(!forum) continue;
			  await forum.update({$addToSet: {followersId: user.uid}});
		  }
	  }
	  await db.UsersSubscribeModel.update({uid: user.uid}, {$set: {subscribeForums: defaultForumsId}});
	  /*const personal = await db.UsersPersonalModel.findOnly({uid: user.uid});
	  data.loginKey = await tools.encryption.aesEncode(user.uid, personal.password.hash);*/
	  const shareToken = ctx.cookies.get('share-token', {signed: true});
	  try{
	    await db.ShareModel.ensureEffective(shareToken);
    } catch(err) {
      return await next();
    }
    const share = await db.ShareModel.findOnly({token: shareToken});
	  if(['', 'visitor'].includes(share.uid)) return await next();
    if(!share.registerReward) return await next();
    let redEnvelopeSettings = await db.SettingModel.findOnly({_id: 'redEnvelope'});
    redEnvelopeSettings = redEnvelopeSettings.c;
    const shareSettings = redEnvelopeSettings.share.register;
    if(!shareSettings.status) return await next();
    const {kcb, maxKcb} = shareSettings;
    const {registerKcbTotal} = share;
    let addKcb;
    if(kcb + registerKcbTotal > maxKcb) {
      addKcb = maxKcb - registerKcbTotal;
    } else {
      addKcb = kcb;
    }
    if(addKcb <= 0) return await next();
    const targetUser = await db.UserModel.findOnly({uid: share.uid});
    const record = db.KcbsRecordModel({
      _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
      from: 'bank',
      to: targetUser.uid,
      type: 'shareRegister',
      description: '用户通过你分享的链接成功注册账号',
      shareToken: shareToken,
      c: {
        token: shareToken
      },
      ip: ctx.address,
      port: ctx.port,
      num: addKcb
    });
    await record.save();
    // 更新分享者以获得的kcb总数
    await share.update({
      $inc: {
        registerKcbTotal: addKcb
      }
    });
    targetUser.kcb = await db.UserModel.updateUserKcb(targetUser.uid);
    ctx.cookies.set('share-token', '', {
      httpOnly: true,
      signed: true
    });
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
		if(pattern.test(username)) ctx.throw(400, '用户名含有非法字符！');
		const targetUser = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
		if(targetUser) ctx.throw(400, '用户名已被注册。');
		if(!password) ctx.throw(400, '请输入密码。');
		if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位。');
		if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
		const {newPasswordObject} = ctx.nkcModules.apiFunction;
		const passwordObj = newPasswordObject(password);
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		user.username = username;
		user.usernameLowerCase = username.toLowerCase();
		await user.save();
		// await user.update({username, usernameLowerCase: username.toLowerCase()});
		await userPersonal.update({hashType: passwordObj.hashType, password: passwordObj.password});
		await db.PersonalForumModel.update({uid: user.uid}, {$set: {
			abbr: username.slice(0.6),
			displayName: username + '的专栏',
			descriptionOfForum: username + '的专栏'
		}});
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
module.exports = registerRouter;