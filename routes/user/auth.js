const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {params, data, db} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const {idCardA, idCardB, handheldIdCard} = await userPersonal.extendIdPhotos();
		data.targetUser = targetUser;
		data.idCardA = idCardA;
		data.idCardB = idCardB;
		data.submittedAuth = userPersonal.submittedAuth;
		data.handheldIdCard = handheldIdCard;
		data.authLevel = await userPersonal.getAuthLevel();
		ctx.template = 'interface_user_auth.pug';
		await next();
	})
	.del('/', async (ctx, next) => {
		const {data, db, params, query} = ctx;
		const {uid} = params;
		const {user} = data;
		if(user.uid !== uid) ctx.throw(403, '权限不足');
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		if(!targetUserPersonal.submittedAuth) ctx.throw(400, '暂未提交任何申请，请刷新');
		const targetUserAuthLevel = await targetUserPersonal.getAuthLevel();
		let {number} = query;
		number = parseInt(number);
		if((targetUserAuthLevel+1) !== number) {
			ctx.throw(400, '参数错误');
		}
		await targetUserPersonal.update({submittedAuth: false});
		await next();
	})
	.post('/2', async (ctx, next) => {
		const {db, params} = ctx;
		const {uid} = params;
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		const targetUserAuthLevel = await targetUserPersonal.getAuthLevel();
		if(targetUserPersonal.submittedAuth) ctx.throw(400, '正在等待审核，请勿提交新申请');
		if(targetUserAuthLevel === 0) ctx.throw(400, '您暂未通过身份认证1，无法提交申请。');
		if(targetUserAuthLevel >= 2) ctx.throw(400, '您已通过身份认证2，不需要再次提交申请');
		const {idCardA, idCardB} = await targetUserPersonal.extendIdPhotos();
		if(!idCardA || !idCardB) ctx.throw(400, '请上传照片后再点击申请审核');
		if(idCardA.status === 'disabled' || idCardB.status === 'disabled') {
			ctx.throw(400, '照片已被封禁，无法申请审核，请重新上传');
		}
		if(idCardA.status === 'notPassed' || idCardB.status === 'notPassed') {
			ctx.throw(400, '照片未通过审核，请重新上传');
		}
		if(idCardA.status === 'outdated' || idCardB.status === 'outdated') {
			ctx.throw(400, '照片未通过审核，请重新上传');
		}
		if(idCardA.status === 'deleted' || idCardB.status === 'deleted') {
			ctx.throw(400, '照片已被删除，请重新上传');
		}
		await targetUserPersonal.update({submittedAuth: true});
		await next();
	})
	.patch('/2', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {uid} = params;
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		const {passed, time, reason} = body;
		const authLevel = await targetUserPersonal.getAuthLevel();
		if(authLevel === 0) ctx.throw(400, '该用户暂未通过身份认证1，无法审核身份认证2');
		const {idCardA, idCardB} = await targetUserPersonal.extendIdPhotos();
		if(passed) {
			if(!time) ctx.throw(400, '过期时间不能为空');
			const timeObj = new Date(time);
			await idCardA.update({status: 'passed', expiryDate: timeObj});
			await idCardB.update({status: 'passed', expiryDate: timeObj});
		} else {
			if(!reason) ctx.throw(400, '原因不能为空');
			await idCardA.update({status: 'notPassed', description: reason});
			await idCardB.update({status: 'notPassed', description: reason});
		}
		await targetUserPersonal.update({submittedAuth: false});
		await next();
	})
	.post('/3', async (ctx, next) => {
		const {db, params} = ctx;
		const {uid} = params;
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		const targetUserAuthLevel = await targetUserPersonal.getAuthLevel();
		if(targetUserPersonal.submittedAuth) ctx.throw(400, '正在等待审核，请勿提交新申请');
		if(targetUserAuthLevel === 0) ctx.throw(400, '您暂未通过身份认证1，无法提交申请。');
		if(targetUserAuthLevel === 1) ctx.throw(400, '您暂未通过身份认证2，无法提交申请。');
		if(targetUserAuthLevel >= 3) ctx.throw(400, '您已通过身份认证3，不需要再次提交申请');
		const {handheldIdCard} = await targetUserPersonal.extendIdPhotos();
		if(!handheldIdCard) ctx.throw(400, '请上传照片后再点击申请审核');
		if(handheldIdCard.status === 'disabled') {
			ctx.throw(400, '照片已被封禁，无法申请审核，请重新上传');
		}
		if(handheldIdCard.status === 'notPassed') {
			ctx.throw(400, '照片未通过审核，请重新上传');
		}
		if(handheldIdCard.status === 'outdated') {
			ctx.throw(400, '照片未通过审核，请重新上传');
		}
		if(handheldIdCard.status === 'deleted') {
			ctx.throw(400, '照片已被删除，请重新上传');
		}
		await targetUserPersonal.update({submittedAuth: true});
		await next();
	})
	.patch('/3', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {uid} = params;
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		const {passed, time, reason} = body;
		const authLevel = await targetUserPersonal.getAuthLevel();
		if(authLevel === 0) ctx.throw(400, '该用户暂未通过身份认证1，无法审核身份认证2');
		const {handheldIdCard} = await targetUserPersonal.extendIdPhotos();
		if(passed) {
			if(!time) ctx.throw(400, '过期时间不能为空');
			const timeObj = new Date(time);
			await handheldIdCard.update({status: 'passed', expiryDate: timeObj});
		} else {
			if(!reason) ctx.throw(400, '原因不能为空');
			await handheldIdCard.update({status: 'notPassed', description: reason});
		}
		await targetUserPersonal.update({submittedAuth: false});
		await next();
	});

module.exports = authRouter;