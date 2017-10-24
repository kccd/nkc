const Router = require('koa-router');
const settings = require('../../settings');
const nkcModules = require('../../nkcModules');
let fn = nkcModules.apiFunction;
const sendMessageRouter = new Router();

sendMessageRouter
  // 手机号码注册
  .post('/register', async (ctx, next) => {
    let db = ctx.db;
    let params = ctx.body;
    let regCode = params.regCode;
    let areaCode = params.areaCode;
    let username = params.username;
    let mobile = (params.areaCode + params.mobile).replace('+', '00');
    if(!mobile) ctx.throw(400, '手机号码不能为空');
    if(!regCode) ctx.throw(400, '注册码不能为空');
    if(!areaCode) ctx.throw(400, '国际区号不能为空');
    let usernameOfDB = await db.UserModel.find({usernameLowerCase: username.toLowerCase()});
    if(usernameOfDB.length !== 0) ctx.throw('404', '用户名已存在，请更换用户名再试！');
    let code = fn.random(6);
    let time = new Date().getTime();
    let time2 = Date.now()-24*60*60*1000;
    try{
      await fn.checkRigsterCode(regCode);
    }catch (err) {
      ctx.throw('404', err);
    }
    let smsCodes = await db.SmsCodeModel.find({mobile: mobile, toc: {$gt: time2}, type: 'register'});
    if(smsCodes.length >= 5) ctx.throw(404, '短信发送次数已达上限，请隔天再试');
    let mobileCodes = await db.MobileCodeModel.find({mobile: mobile});
    if(mobileCodes.length > 0) ctx.throw(404, '此号码已经用于其他用户注册，请检查或更换');
    await settings.mailSecrets.sendSMS(mobile, code , 'register');
    let smsCode = new db.SmsCodeModel({
      mobile: mobile,
      code: code,
      type: 'register'
    });
    await smsCode.save();
    ctx.data.message = '发送成功！';
    await next();
  })
  .post('/reset', async (ctx, next) => {
    ctx.data = '发短信2';
    await next();
  })
  .post('/bindMobile', async (ctx, next) => {
    ctx.data = '发短信3';
    await next();
  });
module.exports = sendMessageRouter;