const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
let apiFn = nkcModules.apiFunction;
let dbFn = nkcModules.dbFunction;
const meRouter = new Router();
meRouter
  .get('/', async (ctx, next) => {
    let db = ctx.db;
    let user = ctx.data.user;
    if(!user) {
      ctx.throw(401, '您还没有登陆，请登录后再试。');
    }
    ctx.data.replyTarget = 'me';
    ctx.data.personal = await db.UsersPersonalModel.findOne({uid: user.uid});
    let subscribe = await db.UserSubscribeModel.findOne({uid: user.uid});
    let subscribeForums = '';
    if(subscribe.subscribeForums) {
      subscribeForums = subscribe.subscribeForums.join(',');
    }else {
      subscribeForums = '';
    }
    ctx.data.user.subscribeForums = subscribeForums;
    ctx.data.forumList = await dbFn.forumList();
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) ctx.data.user.mobile = userPersonal.mobile;
    ctx.template = 'interface_me.pug';
    await next();
  })
  .put('/username', async (ctx, next) => {
    //ctx.data = '修改用户名';
    await next();
  })
  .put('/password', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let user = ctx.data.user;
    if(params.newPassword !== params.newPassword2) ctx.throw(400, '两次输入的密码不一致！请重新输入');
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(!apiFn.testPassword(params.oldPassword, userPersonal.hashType, userPersonal.password)){
      ctx.throw(400, '密码不正确，请重新输入');
    }
    let newPasswordObj = apiFn.newPasswordObject(params.newPassword);
    await db.UsersPersonalModel.updateOne({uid: user.uid}, {$set:newPasswordObj});
    await next();
  })
  .put('/personalsetting', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let user = ctx.data.user;
    let settingObj = {};
    settingObj.postSign = params.post_sign.toString().trim();
    settingObj.description = params.description.toString().trim();
    settingObj.color = params.color.toString().trim();
    let subscribeForums = params.focus_forums.toString().trim() || '';
    subscribeForums = subscribeForums.split(',');
    if(settingObj.postSign.length>300||settingObj.description.length>300||settingObj.color.length>10) {
      ctx.throw(400, '提交的内容字数超出限制，请检查');
    }
    await db.UserModel.update({uid: user.uid}, {$set: settingObj});
    await db.UserSubscribeModel.replaceOne({uid: user.uid},{$set:{subscribeForums: subscribeForums}});
    await next();
  })
  .put('/mobile', async (ctx, next) => {
    // ctx.data = '修改电话号码';
    await next();
  });
module.exports = meRouter;