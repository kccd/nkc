const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
const setRouter = new Router();

setRouter
  .get('/', async (ctx, next) => {
    let user = ctx.data.user;
    if(!user) {
      ctx.throw(401, '您还没有登陆，请登录后再试。');
    }
    ctx.data.replyTarget = 'me';
    ctx.data.personal = await ctx.db.UsersPersonalModel.findOne({uid: user.uid});
    ctx.data.forumList = await nkcModules.apiFunction.forumList();
    ctx.template = 'interface_me.pug';
    next();
  })
  .put('/username', async (ctx, next) => {
    //ctx.data = '修改用户名';
    next();
  })
  .put('/password', async (ctx, next) => {
    let params = ctx.body;
    let user = ctx.data.user;
    if(params.newPassword !== params.newPassword2) {
      ctx.status = 400;
      ctx.data.err = '两次输入的密码不一致！请重新输入';
      return;
    }
    let userPersonal = await ctx.db.UsersPersonalModel.findOne({uid: user.uid});
    if(!nkcModules.apiFunction.testPassword(params.oldPassword, userPersonal.hashType, userPersonal.password)){
      ctx.status = 400;
      ctx.data.err = '密码不正确，请重新输入';
      return;
    }
    let newPasswordObj = nkcModules.apiFunction.newPasswordObject(params.newPassword);
    await ctx.db.UsersPersonalModel.updateOne({uid: user.uid}, {$set:newPasswordObj});
    next();
  })
  .put('/mobile', async (ctx, next) => {
    ctx.data = '修改电话号码';
    next();
  })
  .put('/personalsetting', async (ctx, next) => {
    ctx.data = '修改帖子签名color等';
    next();
  });

module.exports = setRouter;