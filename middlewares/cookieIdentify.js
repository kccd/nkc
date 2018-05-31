const db = require('../dataModels');

module.exports = async (ctx, next) => {
  //cookie identification
	const {data, db} = ctx;
	const visitorRole = await db.RoleModel.findOnly({_id: 'visitor'});
	data.userOperationsId = visitorRole.operationsId;
  const userInfo = ctx.cookies.get('userInfo');
  if(!userInfo) {
    await next();
  } else {
    const {username, uid} = JSON.parse(decodeURI(userInfo));
    const user = await db.UserModel.findOne({uid});
    if (!user || user.username !== username) {
      ctx.cookies.set('userInfo', '');
      ctx.status = 401;
      ctx.error = new Error('缓存验证失败');
      return ctx.redirect('/login')
    }
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
    user.newMessage = (await db.UsersPersonalModel.findOne({uid})).newMessage;
    user.subscribeUsers = (await db.UsersSubscribeModel.findOne({uid})).subscribeUsers;
    user.draftCount = await db.DraftModel.count({uid: user.uid});
    data.user = user;
	  let userOperationsId = [];
	  if(user.certs.includes('banned')) {
	  	user.certs = ['banned'];
	  } else {
	  	// 除被封用户以外的所有用户都拥有普通角色的权限
		  const defaultRole = await db.RoleModel.findOnly({_id: 'default'});
		  userOperationsId = defaultRole.operationsId;
		  // 根据用户积分计算用户等级，并且获取该等级下的所有权限
		  const grade = await user.extendGrade();
		  if(grade) {
			  userOperationsId = userOperationsId.concat(grade.operationsId);
		  }
	  }
	  // 根据用户的角色获取权限
    await Promise.all(user.certs.map(async cert => {
			const role = await db.RoleModel.findOne({_id: cert});
			if(!role) return;
			for(let operationId of role.operationsId) {
				if(!userOperationsId.includes(operationId)) {
					userOperationsId.push(operationId);
				}
			}
    }));
    data.userOperationsId = userOperationsId;
    await next();
  }
};