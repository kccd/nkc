const Router = require('koa-router');
const loginBehaviorMap = require("../../tools/loginBehaviorMap");
const loginRouter = new Router();
loginRouter
	.use('/', async (ctx, next) => {
		const {user} = ctx.data;
		if(user) {
			return ctx.redirect('/');
		}
		await next();
	})
	.get('/', async (ctx, next) => {
		ctx.template = 'login/login.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {db, body, tools} = ctx;
		const {loginType} = body;
		const {
			encryptInMD5WithSalt,
			encryptInSHA256HMACWithSalt,
		} = tools.encryption;

		let user;
		let userPersonal;
		let {password = '', username = '', mobile, nationCode, code} = body;

		const behaviorOptions = {
			type: "login",
			ip: ctx.address,
			port: ctx.port
		};

		if(!loginType) {
			behaviorOptions.username = username;
			behaviorOptions.password = password;
		} else if(loginType === "code") {
			behaviorOptions.mobile = mobile;
			behaviorOptions.nationCode = nationCode;
			behaviorOptions.code = code;
		} else {
			behaviorOptions.mobile = mobile;
			behaviorOptions.nationCode = nationCode;
			behaviorOptions.password = password;
		}

		// 验证次数
		await db.AccountBehaviorModel.ensurePermission(behaviorOptions);

		if(!loginType) {

			// 账号+密码

			if((!username || !password) && ctx.body.fields) {
				username = ctx.body.fields.username;
				password = ctx.body.fields.password;
			}

			if(!username || !password || username.length === 0 || password.length === 0) {
				ctx.throw(400, '缺少用户名或密码')
			}

			const users = await db.UserModel.find({usernameLowerCase: username.toLowerCase()});
			if(users.length === 0) {
				ctx.throw(400, '用户名或密码错误');
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
				ctx.throw(400, '缺少手机号或密码');
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

      // 验证短信验证码
			let smsCode;
			try{
				smsCode = await db.SmsCodeModel.ensureCode(option);
			} catch(err) {
				// 验证未通过，留下记录，用于下一次判断次数
				await db.AccountBehaviorModel.insertBehavior(behaviorOptions);
				ctx.throw(err.status, err.message);
			}

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

			// 更新最后一次验证手机号的时间
			await userPersonal.update({
				$set: {
					lastVerifyPhoneNumberTime: String(Date.now())
				}
			});

			user = await db.UserModel.findOnly({uid: userPersonal.uid});

    } else {
			ctx.throw(400, `未知的登录方式：${loginType}`);
		}

		// 判断用户是否注销
		if(user.destroyed) ctx.throw(400, "此账号已被注销");

		if(loginType !== 'code') {

			let {
				hashType
			} = userPersonal;

      if(!hashType) ctx.throw(400, '账号暂未设置密码，请使用手机号加短信验证码登录。');

			const {hash, salt} = userPersonal.password;

			try{
				if(hashType === "pw9") {
					if(encryptInMD5WithSalt(password, salt) !== hash) {
						if(!loginType) {
							throw "用户名或密码错误";
						} else {
							throw "手机号或密码错误";
						}
					}
				} else if(hashType === "sha256HMAC") {
					if(encryptInSHA256HMACWithSalt(password, salt) !== hash) {
						if(!loginType) {
							throw "用户名或密码错误";
						} else {
							throw "手机号或密码错误";
						}
					}
				} else {
					throw "未知的密码加密类型";
				}
			} catch(err) {
				// 验证未通过，留下记录，用于下一次判断次数
				await db.AccountBehaviorModel.insertBehavior(behaviorOptions);
				ctx.throw(400, err);
			}
		}

		await user.extendGrade();

		ctx.setCookie("userInfo", {
      uid: user.uid,
      username: user.username,
      lastLogin: userPersonal.secret
    });

		ctx.data = {
			user
		};

		await next();
	});
module.exports = loginRouter;
