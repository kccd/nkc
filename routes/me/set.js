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
    let subscribe = await ctx.db.UserSubscribeModel.findOne({uid: user.uid});
    let subscribeForums = '';
    if(subscribe.subscribeForums) {
      subscribeForums = subscribe.subscribeForums.join(',');
    }else {
      subscribeForums = '';
    }
    ctx.data.user.subscribeForums = subscribeForums;
    ctx.data.forumList = await nkcModules.apiFunction.forumList();
    ctx.data.user.mobile = '18582301901';
    ctx.template = 'interface_me.pug';
    await next();
  })
  .put('/username', async (ctx, next) => {
    //ctx.data = '修改用户名';
    await next();
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
    await next();
  })
  .put('/personalsetting', async (ctx, next) => {
    let params = ctx.body;
    let user = ctx.data.user;
    let settingObj = {};
    settingObj.postSign = params.post_sign.toString().trim();
    settingObj.description = params.description.toString().trim();
    settingObj.color = params.color.toString().trim();
    let subscribeForums = params.focus_forums.toString().trim() || '';
    subscribeForums = subscribeForums.split(',');
    if(settingObj.postSign.length>300||settingObj.description.length>300||settingObj.color.length>10) {
      ctx.status = 400;
      ctx.data.err = 'section too long.';
      return;
    }
    await ctx.db.UserModel.update({uid: user.uid}, {$set: settingObj});
    await ctx.db.UserSubscribeModel.replaceOne({uid: user.uid},{$set:{subscribeForums: subscribeForums}});
    await next();
  })
  .put('/mobile', async (ctx, next) => {
    ctx.data = '修改电话号码';
    await next();
  });

module.exports = setRouter;
