const Router = require('koa-router');
const emailRouter = new Router();
emailRouter
	.get('/', async (ctx, next) => {
		await next();
	})
	// 验证绑定邮箱
	.get('/bind', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		let {email, token} = query;
    email = (email || "").toLowerCase();
		await db.SettingModel.checkEmail(email, user.uid);
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const emailCode = await db.EmailCodeModel.ensureEmailCode({
			email,
			token,
			type: 'bindEmail'
		});
		await emailCode.update({used: true});
		await userPersonal.update({email});
		data.success = true;
		ctx.template = 'interface_user_settings_email.pug';
		await next();
	})
	.get("/unbind", async (ctx, next) => {
		const {data, db, query} = ctx;
		const {token} = query;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(!userPersonal.email) ctx.throw(400, "你未绑定任何邮箱");
		const emailCode = await db.EmailCodeModel.ensureEmailCode({
			email: userPersonal.email,
			token,
			type: "unbindEmail"
		});
		await emailCode.update({used: true});
		const behavior = db.SecretBehaviorModel({
			uid: user.uid,
			type: "unbindEmail",
			oldEmail: userPersonal.email,
			newEmail: "",
			ip: ctx.address,
			port: ctx.port
		});
		await behavior.save();
		await userPersonal.update({email: ""});
		await next();
	})
	// 验证新邮箱
	.get('/verify', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		let {email, token, oldToken} = query;
    email = (email || "").toLowerCase();
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		let oldSmsCode, smsCode;
		try {
			oldSmsCode = await db.EmailCodeModel.ensureEmailCode({
				email: userPersonal.email,
				token: oldToken,
				type: 'verifyOldEmail'
			});
		} catch (err) {
			ctx.throw(400, `旧邮箱${err.message}`);
		}
		try {
			smsCode = await db.EmailCodeModel.ensureEmailCode({
				email,
				token,
				type: 'bindEmail'
			});
		} catch (err) {
			ctx.throw(400, `新邮箱${err.message}`);
		}
		await db.SettingModel.checkEmail(email, user.uid);
		await oldSmsCode.update({used: true});
		await smsCode.update({used: true});
		await userPersonal.update({email});
		data.success = true;
		ctx.template = 'interface_user_settings_email.pug';
		await next();
	})

	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {operation} = body;
		if(body.email) body.email = (body.email || "").toLowerCase();
		const {user} = data;
		const {apiFunction, sendEmail} = ctx.nkcModules;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(operation === 'bindEmail') {
			let {email} = body;
			email = email.trim();
			if(!apiFunction.checkEmailFormat(email)) ctx.throw(400, '邮箱格式不正确');
			if(userPersonal.email) ctx.throw(400, '请勿重复绑定邮箱，如需更换请点击“更换邮箱”按钮');
			await db.SettingModel.checkEmail(email, user.uid);
			const sameUserPersonal = await db.UsersPersonalModel.findOne({email});
			if (sameUserPersonal) ctx.throw(400, '该邮箱已被其他账号绑定，请更换');
			const type = 'bindEmail';
			await db.EmailCodeModel.ensureSendPermission({
				email,
				ip: ctx.address,
				type
			});
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				ip: ctx.address,
				email,
				type,
				token,
				uid: user.uid
			});
			await emailCode.save();
			await sendEmail({
        email,
        code: token,
        type
      });
		} else if(operation === 'verifyOldEmail') {
			if(!userPersonal.email) ctx.throw(400, '你暂未绑定任何邮箱');
			const type = 'verifyOldEmail';
			await db.EmailCodeModel.ensureSendPermission({
				email: userPersonal.email,
				ip: ctx.address,
				type
			});
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				email: userPersonal.email,
				type,
				ip: ctx.address,
				token,
				uid: user.uid
			});
			await emailCode.save();
			await sendEmail({
        email: userPersonal.email,
        type: 'changeEmail',
        code: token
      });
		} else if(operation === 'verifyNewEmail') {
			let {email, oldToken} = body;
			email = email.trim();
			try {
				await db.EmailCodeModel.ensureEmailCode({
					email: userPersonal.email,
					token: oldToken,
					ip: ctx.address,
					type: 'verifyOldEmail'
				});
			} catch (err) {
				ctx.throw(400, `旧邮箱${err.message}`);
			}
			await db.SettingModel.checkEmail(email, user.uid);
			const sameUserPersonal = await db.UsersPersonalModel.findOne({email});
			if (sameUserPersonal) ctx.throw(400, '该邮箱已被其他账号绑定，请更换');
			if (email === userPersonal.email) {
				ctx.throw(400, '您已绑定该邮箱，请更换');
			}
			const type = 'bindEmail';
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				email,
				token,
				ip: ctx.address,
				type,
				uid: user.uid
			});
			await emailCode.save();
			await sendEmail({
				type,
				email,
				code: token
			})
		} else if(operation === "destroy") {
			const type = 'destroy';
			if (!userPersonal.email) ctx.throw(400, "你未绑定任何邮箱");
			await db.EmailCodeModel.ensureSendPermission({
				email: userPersonal.email,
				ip: ctx.address,
				type
			});
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				ip: ctx.address,
				email: userPersonal.email,
				type,
				token,
				uid: user.uid
			});
			await emailCode.save();
			await sendEmail({
				email: userPersonal.email,
				type,
				code: token
			});
		} else if(operation === "unbindEmail") {
			const type = "unbindEmail";
			if(!userPersonal.email) ctx.throw(400, "你未绑定任何邮箱");
			await db.EmailCodeModel.ensureSendPermission({
				email: userPersonal.email,
				ip: ctx.address,
				type
			});
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				ip: ctx.address,
				email: userPersonal.email,
				type,
				token,
				uid: user.uid
			});
			await emailCode.save();
			await sendEmail({
				email: userPersonal.email,
				type,
				code: token
			});
		} else {
			ctx.throw(400, '未知的操作类型');
		}
		await next();
	})
	.patch('/', async (ctx, next) => {
		await next();
	});
module.exports = emailRouter;