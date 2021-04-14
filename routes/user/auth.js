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
		data.email = userPersonal.email;
		data.nationCode = userPersonal.nationCode;
		data.mobile = userPersonal.mobile;
		// data.behaviors = await db.UsersBehaviorModel.find({uid: targetUser.uid}).sort({timeStamp: -1});
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
		await targetUserPersonal.updateOne({submittedAuth: false});
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
		await targetUserPersonal.updateOne({submittedAuth: true});
		await next();
	})
	.put('/2', async (ctx, next) => {
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
			await idCardA.updateOne({status: 'passed', expiryDate: timeObj});
			await idCardB.updateOne({status: 'passed', expiryDate: timeObj});
		} else {
			if(!reason) ctx.throw(400, '原因不能为空');
			await idCardA.updateOne({status: 'notPassed', description: reason});
			await idCardB.updateOne({status: 'notPassed', description: reason});
		}
		await targetUserPersonal.updateOne({submittedAuth: false});
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
		await targetUserPersonal.updateOne({submittedAuth: true});
		await next();
	})
	.put('/3', async (ctx, next) => {
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
			await handheldIdCard.updateOne({status: 'passed', expiryDate: timeObj});
		} else {
			if(!reason) ctx.throw(400, '原因不能为空');
			await handheldIdCard.updateOne({status: 'notPassed', description: reason});
		}
		await targetUserPersonal.updateOne({submittedAuth: false});
		await next();
	})
  .use("/:_id", async (ctx, next) => {
    const {method, data, db} = ctx;
    const {user} = data;
    if(method !== "POST") return await next();
    const authSetting = (await db.SettingModel.findById("auth")).c;
    const {auditorCerts, auditorId} = authSetting;
    const users = await db.UserModel.find({uid: {$in: auditorId}}, {uid: 1});
    let uidArr = new Set();
    for(const u of users) {
      uidArr.add(u.uid);
    }
    for(const certId of auditorCerts) {
      const users = await db.UserModel.find({certs: certId}, {uid: 1});
      for(const u of users) {
        uidArr.add(u.uid)
      }
    }
    uidArr = [...uidArr];
    for(const uid of uidArr) {
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        r: uid,
        ty: "STU",
        c: {
          type: "userAuthApply",
          targetUid: user.uid
        }
      });
      await message.save();
      await ctx.redis.pubMessage(message);
    }
    await next();
  });

module.exports = authRouter;
