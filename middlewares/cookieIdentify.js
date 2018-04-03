const db = require('../dataModels');

module.exports = async (ctx, next) => {
  //cookie identification
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
      return redirect('/login')
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
    if(user.certs.includes('banned')) user.certs = ['banned'];
    user.newMessage = (await db.UsersPersonalModel.findOne({uid})).newMessage;
    user.subscribeUsers = (await db.UsersSubscribeModel.findOne({uid})).subscribeUsers;
    ctx.data.user = user;
    await next();
  }
};