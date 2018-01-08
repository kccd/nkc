const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
const dbFn = nkcModules.dbFunction;
const {contentFilter} = require('../../tools/checkString');
const privateInfoRouter = require('./privateInfo');
const meRouter = new Router();
meRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    data.examinated = ctx.query.examinated;
    if(!user) {
      ctx.throw(401, '您还没有登陆，请登录后再试。');
    }
    data.replyTarget = 'me';
    data.personal = await db.UsersPersonalModel.findOnly({uid: user.uid});
    let subscribe = await db.UsersSubscribeModel.findOnly({uid: user.uid});
    let subscribeForums = '';
    if(subscribe.subscribeForums) {
      subscribeForums = subscribe.subscribeForums.join(',');
    }else {
      subscribeForums = '';
    }
    data.user.subscribeForums = subscribeForums;
    data.forumList = await dbFn.getAvailableForums(ctx);
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) data.user.mobile = (userPersonal.mobile.slice(0,3) === '0086')? userPersonal.mobile.replace('0086', '+86'): userPersonal.mobile;
    ctx.template = 'interface_me.pug';
    await next();
  })
  .patch('/username', async (ctx, next) => {
    //data = '修改用户名';
    await next();
  })
  .patch('/password', async (ctx, next) => {
    const db = ctx.db;
    const params = ctx.body;
    const user = ctx.data.user;
    if(!params.oldPassword) ctx.throw(400, '旧密码不能为空');
    if(!params.newPassword || !params.newPassword2) ctx.throw(400, '新密码不能为空');
    if(params.newPassword !== params.newPassword2) ctx.throw(400, '两次输入的密码不一致！请重新输入');
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(!apiFn.testPassword(params.oldPassword, userPersonal.hashType, userPersonal.password)){
      ctx.throw(400, '密码不正确，请重新输入');
    }
    const newPasswordObj = apiFn.newPasswordObject(params.newPassword);
    await db.UsersPersonalModel.updateOne({uid: user.uid}, {$set:newPasswordObj});
    await next();
  })
  .patch('/settings', async (ctx, next) => {
    const db = ctx.db;
    const params = ctx.body;
    const user = ctx.data.user;
    user.postSign = params.post_sign.toString().trim();
    user.description = params.description.toString().trim();
    user.color = params.color.toString().trim();
    let subscribeForums = params.focus_forums.toString().trim() || '';
    subscribeForums = subscribeForums.split(',');
    const relFid = [];
    for (let fid of subscribeForums) {
      const forum = await db.ForumModel.findOne({fid});
      if(forum && !relFid.includes(fid)) relFid.push(fid);
    }
    if(user.postSign.length>300||user.description.length>300||user.color.length>10) {
      ctx.throw(400, '提交的内容字数超出限制，请检查');
    }
    await user.save();
    await db.UsersSubscribeModel.replaceOne({uid: user.uid},{$set:{subscribeForums: relFid}});
    await next();
  })
  .post('/mobile', async (ctx, next) => {
    const {db} = ctx;
    const {user} = ctx.data;
    const {mobile, areaCode, code} = ctx.body;
    if(!mobile) ctx.throw(400, '电话号码不能为空！');
    if(!areaCode) ctx.throw(400, '国际区号不能为空！');
    if(!code) ctx.throw(400, '手机短信验证码不能为空！');
    const newMobile = (areaCode + mobile).replace('+', '00');
    const userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) ctx.throw(400, `此账号已绑定手机号码： ${userPersonal.mobile}`);
    const mobileCodesNumber = await dbFn.checkMobile(newMobile, mobile);
    if(mobileCodesNumber > 0) ctx.throw(400, '此号码已经用于其他用户注册，请检查或更换');
    const smsCode = await dbFn.checkMobileCode(newMobile, code);
    if(!smsCode) ctx.throw(400, '手机验证码错误或过期，请检查');
    await db.UsersPersonalModel.replaceOne({uid: user.uid}, {$set: {mobile: newMobile}});
    await user.update({$addToSet: {certs: 'mobile'}});
    await smsCode.update({used: true});
    await next();
  })
  .get('/resource', async (ctx, next) => {
    const {user} = ctx.data;
    const {db} = ctx;
    const quota = parseInt(ctx.query.quota);
    ctx.data.resources = await db.ResourceModel.find({uid: user.uid}).sort({toc: -1}).limit(quota);
    await next();
  })
  .get('/threads', async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {pid} = ctx.query;
    const page = ctx.query.page?parseInt(ctx.query.page): 0;
    if(pid){
      const thread = await db.ThreadModel.findOne({oc: pid, disabled: false});
      if(!thread) ctx.throw(400, '没有与之匹配的帖子');
      await thread.extendFirstPost();
      data.threads=[thread.toObject()];
      console.log(data.threads)
    } else {
      const q = {
        uid: user.uid,
        fid: {$ne: 'recycle'}
      };
      const length = await db.ThreadModel.count(q);
      let start;
      const perpage = 20;
      start  = page*perpage;
      data.paging = {
        page: page,
        pageCount: Math.ceil(length/perpage),
        perpage: perpage
      };
      const threads = await db.ThreadModel.find(q).skip(start).limit(perpage);
      data.threads = await Promise.all(threads.map(async t => {
        await t.extendFirstPost();
        return t.toObject();
      }));
    }
    await next();
  })
	.use('/privateInfo', privateInfoRouter.routes(), privateInfoRouter.allowedMethods());

module.exports = meRouter;