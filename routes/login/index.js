const Router = require('koa-router');
const loginRouter = new Router();
loginRouter
	.use('/', async (ctx, next) => {
		const {nkcModules} = ctx;
		const {user} = ctx.data;
		if(user) {
			return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, '/'));
		}
		await next();
	})
	.get('/', async (ctx, next) => {
		ctx.template = 'login/login.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, tools} = ctx;
		const {loginType} = body;
		const {
			encryptInMD5WithSalt,
			encryptInSHA256HMACWithSalt,
		} = tools.encryption;

		let user;
		let userPersonal;
		let {password, username, mobile, nationCode, code, imgCode} = body;
		if(!loginType) {

			// 账号+密码

			if(!username || !password) {
				username = ctx.body.fields.username;
				password = ctx.body.fields.password;
			}

			if(!username || !password || username.length === 0 || password.length === 0) {
				ctx.throw('缺少用户名或密码')
			}

			const users = await db.UserModel.find({usernameLowerCase: username.toLowerCase()});
			if(users.length === 0) {
				ctx.throw(400, '用户名不存在, 请检查用户名');
			}
			if(users.length > 1) {
				/*历史原因, 数据库中可能出现同名或者用户名小写重复的用户, which导致一些奇怪的问题, 兼容代码*/
				ctx.throw(400, '用户名冲突, 请报告: bbs@kc.ac.cn');
			}
			user = users[0];
			userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});

		} else if(loginType === 'mobile') {

			// 手机号+密码

			if(!nationCode) {
				ctx.throw(400, '请选择国家区号');
			}
			if(!mobile || !password) {
				ctx.throw('缺少手机号或密码');
			}
			userPersonal = await db.UsersPersonalModel.find({mobile, nationCode});
			if(userPersonal.length === 0) {
				ctx.throw(400, '手机号或密码错误');
			}
			if(userPersonal.length > 1) {
				// 历史原因，数据空中可能存在同手机号的用户;
				ctx.throw(400, '该手机对应多个用户名，请使用用户名登录');
			}
			userPersonal = userPersonal[0];
			user = await db.UserModel.findOnly({uid: userPersonal.uid});

		} else if(loginType === 'code') {

			// 手机号+短信验证码
			if(!nationCode) {
				ctx.throw(400, '请选择国家区号');
			}
			if(!mobile) {
				ctx.throw(400, '手机号码不能为空');
			}
			if(!code) {
				ctx.throw(400, '短信验证码不能为空');
			}

			const option = {
				nationCode,
				mobile,
				code,
				type: 'login'
			};

			let imgCodeId = ctx.getCookie("imgCodeId") || "";
			if(imgCodeId) imgCodeId = imgCodeId.imgCodeId;

      const imgCodeObj = await db.ImgCodeModel.ensureCode(imgCodeId, imgCode);

      ctx.setCookie("imgCodeId", "");

      await imgCodeObj.update({used: true});

      // 验证短信验证码
			const smsCode = await db.SmsCodeModel.ensureCode(option);

			await smsCode.update({used: true});

			userPersonal = await db.UsersPersonalModel.find({mobile, nationCode});

			if(userPersonal.length === 0) {
				ctx.throw(400, '手机号不存在');
			}
			if(userPersonal.length > 1) {
				// 历史原因，数据空中可能存在同手机号的用户;
				ctx.throw(400, '该手机对应多个用户名，请使用用户名登录');
			}
			userPersonal = userPersonal[0];

			user = await db.UserModel.findOnly({uid: userPersonal.uid});

      await imgCodeObj.update({uid: user.uid});

    } else {
			ctx.throw(400, `未知的登录方式：${loginType}`);
		}

		if(loginType !== 'code') {

			let {
				tries=1,
				lastTry = 0,
				hashType
			} = userPersonal;

      if(!hashType) ctx.throw(400, '账号暂未设置密码，请使用手机号加短信验证码登录。');

			const {hash, salt} = userPersonal.password;

			const loginSettings = await db.SettingModel.getSettings("login");

			if(Date.now() - lastTry < 3600000) {
        if(tries >= loginSettings.maxLoginCountOneHour) {
          ctx.throw(400, '密码错误次数过多, 请在一小时后再试');
        }
      } else {
			  tries = 0;
      }
			switch(hashType) {
				case 'pw9':
					if(encryptInMD5WithSalt(password, salt) !== hash) {
						tries++;
						lastTry = Date.now();
						await userPersonal.update({tries, lastTry});
						ctx.throw(400, '密码错误, 请重新输入');
					}
					break;
				case 'sha256HMAC':
					if(encryptInSHA256HMACWithSalt(password, salt) !== hash) {
						tries++;
						lastTry = Date.now();
						await userPersonal.update({tries, lastTry});
						ctx.throw(400, '密码错误, 请重新输入');
					}
					break;
				default: ctx.throw(400, '未知的密码加密类型');
			}
			tries = 0;
			await userPersonal.update({tries});

		}

		await user.extendGrade();

		ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
      lastLogin: Date.now()
    });

		ctx.data = {
			user
		};

		await next();
	});
module.exports = loginRouter;