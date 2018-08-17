module.exports = async (ctx, next) => {

	const {data, db} = ctx;

	// cookie
	const userInfo = ctx.cookies.get('userInfo', {signed: true});
	// app
	const {loginUid, loginKey} = ctx.query || [];

	let userOperationsId = [], userRoles = [], userGrade = [];

	let user;

	if(userInfo) {
		const {username, uid} = JSON.parse(decodeURI(userInfo));
		user = await db.UserModel.findOne({uid});
		if(!user || user.username !== username) {
			ctx.cookies.set('userInfo', '');
			ctx.status = 401;
			ctx.error = new Error('缓存验证失败');
			return ctx.redirect('/login');
		}
	} else if(loginUid && loginKey) {
		const {aesDecode} = ctx.tools.encryption;
		let uid;
		try{
			const userPersonal = await db.UsersPersonalModel.findOne({uid: loginUid});
			uid = aesDecode(loginKey, userPersonal.password.hash);
			if(uid === loginUid) {
				user = await db.UserModel.findOne({uid});

				// 设置cookie
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
			}
		} catch(err) {
			// console.log(err);
		}


	}

	if(!user) {
		// 游客
		const visitorRole = await db.RoleModel.findOnly({_id: 'visitor'});
		userOperationsId = visitorRole.operationsId;
		userRoles = [visitorRole];
	} else {
		// 用户
		await user.update({tlv: Date.now()});
		if(!user.certs.includes('default')) {
			user.certs.unshift('default');
		}
		if(user.xsf > 0) {
			if(!user.certs.includes('scholar')) {
				user.certs.push('scholar');
			}
		} else {
			const index = user.certs.indexOf('scholar');
			if(index !== -1) {
				user.certs.splice(index, 1);
			}
		}

		// 获取用户信息
		const userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
		user.newMessage = userPersonal.newMessage;
		user.authLevel = await userPersonal.getAuthLevel();
		user.subscribeUsers = (await db.UsersSubscribeModel.findOne({uid: user.uid})).subscribeUsers;
		user.draftCount = await db.DraftModel.count({uid: user.uid});

		// 判断用户是否被封禁
		if(user.certs.includes('banned')) {
			user.certs = ['banned'];
		} else {
			// 除被封用户以外的所有用户都拥有普通角色的权限
			const defaultRole = await db.RoleModel.findOnly({_id: 'default'});
			userOperationsId = defaultRole.operationsId;
			// 根据用户积分计算用户等级，并且获取该等级下的所有权限
			userGrade = await user.extendGrade();
			if(userGrade) {
				userOperationsId = userOperationsId.concat(userGrade.operationsId);
			}
		}

		// 根据用户的角色获取权限
		await Promise.all(user.certs.map(async cert => {
			const role = await db.RoleModel.findOne({_id: cert});
			if(!role) return;
			userRoles.push(role);
			for(let operationId of role.operationsId) {
				if(!userOperationsId.includes(operationId)) {
					userOperationsId.push(operationId);
				}
			}
		}));
	}
	data.userOperationsId = userOperationsId;
	data.userRoles = userRoles;
	data.userGrade = userGrade || {};
	data.user = user;
	await next();
};