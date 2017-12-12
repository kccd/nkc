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
      return ctx.redirect('/login')
    }
    await user.update({tlv: Date.now()});
    if(user.xsf > 0 && !user.certs.includes('qc')) user.certs.push('qc');
    user.newMessage = (await db.UsersPersonalModel.findOne({uid})).newMessage;
    user.subscribeUsers = (await db.UsersSubscribeModel.findOne({uid})).subscribeUsers;
    ctx.data.user = user;
    await next();
  }
};