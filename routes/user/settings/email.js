const Router = require('koa-router');
const emailRouter = new Router();
emailRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		let {email, token, operation} = query;
		data.operation = operation;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.userEmail = userPersonal.email;
		if(email && token && operation === 'bindEmail') {
			/*const emailCode = await db.EmailCodeModel.ensureEmailCode({
				email,
				token,
				type: 'bindEmail'
			});
			await emailCode.update({used: true});
			await userPersonal.update({email});
			await user.update({$addToSet: {certs: 'email'}});
			const newSecretBehavior = db.SecretBehaviorModel({
				uid: user.uid,
				type: 'bindEmail',
				ip: ctx.address,
				port: ctx.port,
				email
			});
			await newSecretBehavior.save();
			return ctx.redirect(`/u/${user.uid}/settings/email`);*/
		} else if(operation === 'verifyOldEmail') {
			await db.EmailCodeModel.ensureEmailCode({
				email: userPersonal.email,
				token,
				type: 'verifyOldEmail'
			});
			data.operation = 'changeEmail';
			data.email = userPersonal.email;
			data.token = token;
		} else if(operation === 'verifyNewEmail') {
			/*const {oldToken} = query;
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
			await oldSmsCode.update({used: true});
			await smsCode.update({used: true});
			const newSecretBehavior = db.SecretBehaviorModel({
				uid: user.uid,
				type: 'changeEmail',
				ip: ctx.address,
				port: ctx.port,
				oldEmail: userPersonal.email,
				newEmail: email
			});
			await userPersonal.update({email});
			await user.update({$addToSet: {certs: 'email'}});
			await newSecretBehavior.save();
			return ctx.redirect(`/u/${user.uid}/settings/email`);*/
		}
		ctx.template = 'interface_user_settings_email.pug';
		await next();
	})
	// 验证绑定邮箱
	.get('/bind', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {email, token} = query;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const emailCode = await db.EmailCodeModel.ensureEmailCode({
			email,
			token,
			type: 'bindEmail'
		});
		await emailCode.update({used: true});
		await userPersonal.update({email});
		await user.update({$addToSet: {certs: 'email'}});
		/*const newSecretBehavior = db.SecretBehaviorModel({
			uid: user.uid,
			type: 'bindEmail',
			ip: ctx.address,
			port: ctx.port,
			email
		});
		await newSecretBehavior.save();*/
		data.success = true;
		ctx.template = 'interface_user_settings_email.pug';
		await next();
	})
	// 验证新邮箱
	.get('/verify', async (ctx, next) => {
		const {data, db, query} = ctx;
		const {user} = data;
		const {email, token, oldToken} = query;
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
		await oldSmsCode.update({used: true});
		await smsCode.update({used: true});
		/*const newSecretBehavior = db.SecretBehaviorModel({
			uid: user.uid,
			type: 'changeEmail',
			ip: ctx.address,
			port: ctx.port,
			oldEmail: userPersonal.email,
			newEmail: email
		});*/
		// await newSecretBehavior.save();
		await userPersonal.update({email});
		await user.update({$addToSet: {certs: 'email'}});
		data.success = true;
		ctx.template = 'interface_user_settings_email.pug';
		await next();
	})

	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {operation} = body;
		const {user} = data;
		const {apiFunction, sendEmail} = ctx.nkcModules;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		if(operation === 'bindEmail') {
			let {email} = body;
			email = email.trim();
			if(!apiFunction.checkEmailFormat(email)) ctx.throw(400, '邮箱格式不正确');
			if(userPersonal.email) ctx.throw(400, '请勿重复绑定邮箱，如需更换请点击“更换邮箱”按钮');
			if(userPersonal.email === email) ctx.throw(400, '您已绑定该邮箱，请更换');
			const type = 'bindEmail';
			await db.EmailCodeModel.ensureSendPermission({
				email,
				type
			});
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				email,
				type,
				token,
				uid: user.uid
			});
			await emailCode.save();
			const text = `科创论坛账号绑定邮箱，点击以下链接或直接输入验证码完成邮箱验证。`;
			const href = `https://www.kechuang.org/u/${user.uid}/settings/email/bind?email=${email}&token=${token}`;
			const link = `<h3>链接：<strong><a href="${href}">${href}</a></strong></h3>`;
			const h3 = `<h3>验证码：<strong>${token}</strong></h3>`;
			await sendEmail({
				to: email,
				subject: '绑定邮箱',
				text,
				html: text + link + h3
			});
		} else if(operation === 'verifyOldEmail') {
			if(!userPersonal.email) ctx.throw(400, '您暂未绑定任何邮箱');
			const type = 'verifyOldEmail';
			await db.EmailCodeModel.ensureSendPermission({
				email: userPersonal.email,
				type
			});
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				email: userPersonal.email,
				type,
				token,
				uid: user.uid
			});
			await emailCode.save();
			const text = `科创论坛账号修改邮箱，点击以下链接或直接输入验证码完成邮箱验证。`;
			const href = `https://www.kechuang.org/u/${user.uid}/settings/email?token=${token}&operation=verifyOldEmail`;
			const link = `<h3>链接：<strong><a href="${href}">${href}</a></strong></h3>`;
			const h3 = `<h3>验证码：<strong>${token}</strong></h3>`;
			await sendEmail({
				to: userPersonal.email,
				subject: '修改邮箱',
				text,
				html: text + link + h3
			});
		} else if(operation === 'verifyNewEmail') {
			let {email, oldToken} = body;
			email = email.trim();
			try {
				await db.EmailCodeModel.ensureEmailCode({
					email: userPersonal.email,
					token: oldToken,
					type: 'verifyOldEmail'
				});
			} catch (err) {
				ctx.throw(400, `旧邮箱${err.message}`);
			}
			const sameUserPersonal = await db.UsersPersonalModel.findOne({email});
			if(sameUserPersonal) ctx.throw(400, '该邮箱已被其他账号绑定，请更换');
			if(email === userPersonal.email) {
				ctx.throw(400, '您已绑定该邮箱，请更换');
			}
			const type = 'bindEmail';
			const token = apiFunction.getEmailToken();
			const emailCode = db.EmailCodeModel({
				email,
				token,
				type,
				uid: user.uid
			});
			await emailCode.save();
			const text = `科创论坛账号绑定邮箱，点击以下链接或直接输入验证码完成邮箱验证。`;
			const href = `https://www.kechuang.org/u/${user.uid}/settings/email/verify?email=${email}&token=${token}&oldToken=${oldToken}`;
			const link = `<h3>链接：<strong><a href="${href}">${href}</a></strong></h3>`;
			const h3 = `<h3>验证码：<strong>${token}</strong></h3>`;
			await sendEmail({
				to: email,
				subject: '修改邮箱',
				text,
				html: text + link + h3
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