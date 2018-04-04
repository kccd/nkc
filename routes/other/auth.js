const Router = require('koa-router');
const authRouter = new Router();
authRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		const userPersonalArr = await db.UsersPersonalModel.find({submittedAuth: true}).sort({toc: 1});
		data.usersAuth = await Promise.all(userPersonalArr.map(async u => {
			const authLevel = await u.getAuthLevel();
			const idCardPhotos = await u.extendIdPhotos();
			const targetUser = await db.UserModel.findOnly({uid: u.uid});
			return {
				idCardPhotos,
				authLevel,
				targetUser
			}
		}));
		data.type = 'list';
		ctx.template = 'interface_auth.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body} = ctx;
		const {user} = data;
		const {number} = body;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		const authLevel = await userPersonal.getAuthLevel();
		// 不能反复提交申请
		if(userPersonal.submittedAuth) ctx.throw(400, `您已提交 “身份认证${authLevel+1}” 的申请，请耐心等待！`);
		// 身份认证顺序 1 -> 2 -> 3
		if(authLevel !== (number - 1)) ctx.throw(400, `请先通过 “身份认证${authLevel+1}” ！`);
		// 判断照片是否上传
		const {idCardA, idCardB, handheldIdCard} = await userPersonal.extendIdPhotos();
		if(number === 2 && (!idCardA || !idCardB)) ctx.throw(400, '提交失败，请上传身份证正反面照片之后再点击提交按钮！');
		if(number === 3 && !handheldIdCard) ctx.throw(400, '提交失败，请上传手持身份证照片之后再点击提交按钮！');
		// 判断提交的照片是否已经处理过
		const arr = ['passed', 'notPassed'];
		if(number === 2 && idCardA.status === 'notPassed' || idCardA.status === 'notPassed') ctx.throw(400, '照片未能通过审核，请勿重复提交！');
		if(number === 3 && arr.includes(handheldIdCard.status)) ctx.throw(400, '照片已经审核过了，请勿提交相同的照片！');
		await userPersonal.update({submittedAuth: true});
		await next();
	})
	.get('/:uid', async(ctx, next) => {
		const {data, db, params} = ctx;
		const {uid} = params;
		const targetUser = await db.UserModel.findOnly({uid});
		const targetUserPersonal = await db.UsersPersonalModel.findOnly({uid});
		data.targetUser = targetUser;
		data.authLevel = await targetUserPersonal.getAuthLevel();
		data.idCardPhotos = await targetUserPersonal.extendIdPhotos();
		ctx.template = 'interface_auth.pug';
		await next();
	})
	.patch('/:uid', async (ctx, next) => {
		const {db, body, params} = ctx;
		const {reason, type, time} = body;
		let {status} = body;
		const {uid} = params;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const idCardPhotos = await userPersonal.extendIdPhotos();
		const photo = idCardPhotos[type];
		if(status === true){
			if(!time) ctx.throw(400, '请输入正确的时间！');
			status = 'passed';
		} else {
			status = 'notPassed';
		}
		photo.description = reason;
		await photo.update({description: reason, status, expiryDate: time});
		photo.status = status;
		const {idCardA, idCardB} = idCardPhotos;
		if(['idCardA', 'idCardB'].includes(type) && ['passed', 'notPassed'].includes(idCardA.status) && ['passed', 'notPassed'].includes(idCardB.status)) {
			await userPersonal.update({submittedAuth: false});
		}
		if(type === 'handheldIdCard') {
			await userPersonal.update({submittedAuth: false});
		}
		await next();
	})
	.del('/:uid', async (ctx, next) => {
		const {data, db, query, params} = ctx;
		const {uid} = params;
		const {number} = query;
		const {user, userLevel} = data;
		if(user.uid !== uid && userLevel < 7) ctx.throw(403,'权限不足');
		const userPersonal = await db.UsersPersonalModel.findOnly({uid});
		const authLevel = await userPersonal.getAuthLevel();
		if(!userPersonal.submittedAuth) ctx.throw(400, `暂未有已提交的申请。`);
		if(authLevel !== (number - 1)) ctx.throw(400, `参数不正确，您只完成了身份认证${authLevel},无法进行身份认证${number}的操作！`);
		await userPersonal.update({submittedAuth: false});
		await next();
	});
module.exports = authRouter;