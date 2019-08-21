const Router = require('koa-router');
const registerRouter = new Router();
const captcha = require("../../nkcModules/captcha");
const cookieConfig = require("../../config/cookie");
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

    let imgCodeId = ctx.getCookie("imgCodeId") || "";
    if(imgCodeId) imgCodeId = imgCodeId.imgCodeId;

    const imgCodeObj = await db.ImgCodeModel.ensureCode(imgCodeId, imgCode);

    ctx.setCookie("imgCodeId", "");

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
		await user.extendGrade();

    await imgCodeObj.update({uid: user.uid});

    ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
      lastLogin: Date.now()
    });
	  ctx.data = {
		  user
	  };
	  let shareToken = ctx.getCookie('share-token');
	  if(shareToken) shareToken = shareToken.token;
	  try{
	    await db.ShareModel.ensureEffective(shareToken);
    } catch(err) {
      ctx.setCookie('share-token', '');
      return await next();
    }
    const share = await db.ShareModel.findOnly({token: shareToken});
    await share.computeReword("register", ctx.address, ctx.port);
    ctx.setCookie('share-token', '');
	  await next();
  })
	/*.post('/information', async (ctx, next) => {
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
		const sameNameColumn = await db.ColumnModel.findOne({nameLowerCase: username.toLowerCase()});
		if(sameNameColumn) ctx.throw(400, "用户名已存在");
		if(!password) ctx.throw(400, '请输入密码。');
		if(contentLength(password) < 8) ctx.throw(400, '密码长度不能小于8位。');
		if(!checkPass(password)) ctx.throw(400, '密码要具有数字、字母和符号三者中的至少两者。');
		const {newPasswordObject} = ctx.nkcModules.apiFunction;
		const passwordObj = newPasswordObject(password);
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		user.username = username;
		user.usernameLowerCase = username.toLowerCase();
		await user.save();
		await userPersonal.update({hashType: passwordObj.hashType, password: passwordObj.password});
		ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
    });
		await next();
	})*/
	.get('/code', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		if(user) ctx.throw(400, '您已注册，无法获取图形验证码。');
		const codeData = captcha.createRegisterCode();
		const imgCode = db.ImgCodeModel({
			token: codeData.text
		});
		await imgCode.save();
		ctx.setCookie("imgCodeId", {imgCodeId: imgCode._id});
		ctx.logIt = true;
    data.svgData = codeData.data;
		await next();
	})
  .get("/subscribe", async (ctx, next) => {
    const {state, query, db, data} = ctx;
    const {t} = query;
    if(!t) {
      ctx.template = "register/subscribe.pug";
    } else if(t === "user") {
      const registerSettings = await db.SettingModel.getSettings("register");
      const {recommendUsers} = registerSettings;
      data.subUsersId = state.subUsersId;
      let users = await db.UserModel.aggregate([
        {
          $match: {
            certs: {$ne: "band"},
            tlv: {$gte: new Date(Date.now() - recommendUsers.lastVisitTime*24*60*60*1000)},
            xsf: {$gte: recommendUsers.xsf},
            digestThreadsCount: {$gte: recommendUsers.digestThreadsCount},
            threadCount: {$gte: recommendUsers.threadCount},
            postCount: {$gte: recommendUsers.postCount},
          }
        },
        {
          $project: {
            uid: 1
          }
        },
        {
          $sample: {
            size: recommendUsers.usersCount
          }
        }
      ]);
      const usersId = users.map(u => u.uid);
      users = await db.UserModel.find({uid: {$in: usersId}});
      users.map(u => u.extendGrade());
      data.users = await db.UserModel.extendUsersInfo(users);
    }
    await next();
  });
module.exports = registerRouter;