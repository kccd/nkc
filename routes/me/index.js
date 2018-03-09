const Router = require('koa-router');
const nkcModules = require('../../nkcModules');
const apiFn = nkcModules.apiFunction;
const dbFn = nkcModules.dbFunction;
const {encryption} = require('../../tools');
const settingsRouter = require('./settings');
const meRouter = new Router();
const education = require('./education');
const industries = require('./industries');
const addresses = require('./addresses');
const personalInfo = require('./personalInfo');

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
    if(userPersonal.mobile) {
    	data.user.mobile = userPersonal.mobile;
    	data.user.nationCode = userPersonal.nationCode;
    }
    ctx.template = 'interface_me.pug';
    await next();
  })
  .patch('/username', async (ctx, next) => {
    //data = '修改用户名';
    await next();
  })
  .patch('/password', async (ctx, next) => {
	  const {
		  encryptInMD5WithSalt,
		  encryptInSHA256HMACWithSalt
	  } = ctx.tools.encryption;
    const db = ctx.db;
    const params = ctx.body;
    const user = ctx.data.user;
    if(!params.oldPassword) ctx.throw(400, '旧密码不能为空');
    if(!params.newPassword || !params.newPassword2) ctx.throw(400, '新密码不能为空');
    if(params.newPassword !== params.newPassword2) ctx.throw(400, '两次输入的密码不一致！请重新输入');
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    const {hashType} = userPersonal;
    const {hash, salt} = userPersonal.password;
    const password = params.oldPassword;
	  switch(hashType) {
		  case 'pw9':
			  if(encryptInMD5WithSalt(password, salt) !== hash) {
				  ctx.throw(400, '旧密码错误, 请重新输入');
			  }
			  break;
		  case 'sha256HMAC':
			  if(encryptInSHA256HMACWithSalt(password, salt) !== hash) {
				  ctx.throw(400, '旧密码错误, 请重新输入');
			  }
			  break;
		  default:
		  	ctx.throw(500, '数据库异常, 请报告: bbs@kc.ac.cn');
	  }
    /*if(!apiFn.testPassword(params.oldPassword, userPersonal.hashType, userPersonal.password)){
      ctx.throw(400, '密码不正确，请重新输入');
    }*/
    const newPasswordObj = apiFn.newPasswordObject(params.newPassword);
    await db.UsersPersonalModel.updateOne({uid: user.uid}, {$set:newPasswordObj});
    await next();
  })
  .post('/mobile', async (ctx, next) => {
    const {db} = ctx;
    const {user} = ctx.data;
    const {mobile, nationCode, code} = ctx.body;
    if(!mobile) ctx.throw(400, '电话号码不能为空！');
    if(!nationCode) ctx.throw(400, '国际区号不能为空！');
    if(!code) ctx.throw(400, '手机短信验证码不能为空！');
    const userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) ctx.throw(400, `此账号已绑定手机号码： ${userPersonal.mobile}`);
    const mobileCodesNumber = await dbFn.checkMobile(nationCode, mobile);
    if(mobileCodesNumber > 0) ctx.throw(400, '此号码已经用于其他用户注册，请检查或更换');
    const smsCode = await dbFn.checkMobileCode(nationCode, mobile, code);
    if(!smsCode) ctx.throw(400, '手机验证码错误或过期，请检查');
    await db.UsersPersonalModel.replaceOne({uid: user.uid}, {$set: {mobile: mobile, nationCode: nationCode}});
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
	.get('/life_photos', async (ctx, next) => {
		const {data, db} = ctx;
		const {user} = data;
		const userPersonal = await db.UsersPersonalModel.findOnly({uid: user.uid});
		data.lifePhotos = await userPersonal.extendLifePhotos();
		await next();
	})
	.use('/settings', settingsRouter.routes(), settingsRouter.allowedMethods())
  .use('/personal_info', personalInfo.routes(), personalInfo.allowedMethods())
  .use('/addresses', addresses.routes(), addresses.allowedMethods())
  .use('/industries', industries.routes(), industries.allowedMethods())
  .use('/education', education.routes(), education.allowedMethods());

module.exports = meRouter;