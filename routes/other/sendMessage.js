const Router = require('koa-router');
const settings = require('../../settings');
const nkcModules = require('../../nkcModules');
let apiFn = nkcModules.apiFunction;
let dbFn = nkcModules.dbFunction;
const sendMessageRouter = new Router();

sendMessageRouter
  // 手机号码注册
  .post('/register', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let regCode = params.regCode;
    let nationCode = params.nationCode;
    let username = params.username;
    let mobile = params.mobile;
    if(!mobile) ctx.throw(400, '手机号码不能为空');
    if(!regCode) ctx.throw(400, '注册码不能为空');
    if(!nationCode) ctx.throw(400, '国际区号不能为空');
    let code = apiFn.random(6);
    try{
      await dbFn.checkRegisterCode(regCode);
    }catch (err) {
      ctx.throw(400, err);
    }
    let usernameOfDBNumber = await dbFn.checkUsername(username);
    if(usernameOfDBNumber !== 0) ctx.throw(400, '用户名已存在，请更换用户名再试！');
    let mobileCodesNumber = await dbFn.checkMobile(nationCode, mobile);
    if(mobileCodesNumber > 0) ctx.throw(400, '此号码已经用于其他用户注册，请检查或更换');
    let smsCodesNumber = await dbFn.checkNumberOfSendMessage(nationCode, mobile, 'register');
    if(smsCodesNumber >= settings.sendMessage.sendMobileCodeCount) ctx.throw(400, '短信发送次数已达上限，请隔天再试');
    let smsCode = new db.SmsCodeModel({
      mobile: mobile,
	    nationCode: nationCode,
      code: code,
      type: 'register'
    });
    await smsCode.save();
    await ctx.nkcModules.sendMessage({
	    mobile: mobile,
	    code: code,
	    type: 'register',
	    nationCode: nationCode
    });
    ctx.data.message = '发送成功！';
    await next();
  })
  .post('/getback', async (ctx, next) => {
    const {db} = ctx;
    let {username, mobile, nationCode} = ctx.body;
    if(!username) ctx.throw(400, '用户名不能为空！');
    if(!nationCode) ctx.throw(400, '国际区号不能为空！');
    if(!mobile) ctx.throw(400, '电话号码不能为空！');
    let user = await db.UserModel.findOne({usernameLowerCase: username.toLowerCase()});
    if(!user) ctx.throw(400, `用户名不存在，请重新输入`);
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(!userPersonal.mobile) ctx.throw(400, '账号未绑定手机号，请通过其他方式找回密码');
    if(mobile !== userPersonal.mobile) ctx.throw(400, '账号与手机号无法对应，请重新输入');
    if(nationCode !== userPersonal.nationCode) ctx.throw(400, '国际区号不匹配');
    let smsCodesNumber = await dbFn.checkNumberOfSendMessage(nationCode, mobile, 'reset');
    if(smsCodesNumber >= settings.sendMessage.sendMobileCodeCount) ctx.throw(400, '短信发送次数已达上限，请隔天再试');
    let code = apiFn.random(6);
    let smsCode = new db.SmsCodeModel({
      mobile: mobile,
      code: code,
      type: 'getback',
	    nationCode: nationCode
    });
    await smsCode.save();
    await ctx.nkcModules.sendMessage({
	    mobile: mobile,
	    code: code ,
	    type: 'getback',
	    nationCode: nationCode
    });
    ctx.data.message = '发送成功！';
    await next();
  })
  .post('/bindMobile', async (ctx, next) => {
    let {db} = ctx;
    let {user} = ctx.data;
    let {mobile, nationCode} = ctx.body;
    if(!mobile) ctx.throw(400, '电话号码不能为空！');
    if(!nationCode) ctx.throw(400, '国际区号不能为空！');
    let userPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    if(userPersonal.mobile) ctx.throw(400, `账号已绑定手机号码： ${userPersonal.mobile}`);
    let mobileCodesNumber = await dbFn.checkMobile(nationCode, mobile);
    if(mobileCodesNumber > 0) ctx.throw(400, '此号码已经用于其他用户注册，请检查或更换');
    let smsCodesNumber = await dbFn.checkNumberOfSendMessage(nationCode, mobile, 'bindMobile');
    if(smsCodesNumber >= settings.sendMessage.sendMobileCodeCount) ctx.throw(400, '短信发送次数已达上限，请隔天再试');
    let code = apiFn.random(6);
    let smsCode = new db.SmsCodeModel({
      mobile: mobile,
      code: code,
      type: 'bindMobile',
	    nationCode: nationCode
    });
    await smsCode.save();
    await ctx.nkcModules.sendMessage({
	    mobile: mobile,
	    code: code,
	    type: 'bindMobile',
	    nationCode: nationCode
    });
    ctx.data.message = '发送成功！';
    await next();
  });
module.exports = sendMessageRouter;