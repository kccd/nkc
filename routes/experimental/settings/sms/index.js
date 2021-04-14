const Router = require('koa-router');
const smsRouter = new Router();
smsRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
    data.smsSettings = await db.SettingModel.getSettings('sms');
    data.smsSettings.appKey = "**********************************";
    ctx.template = 'experimental/settings/sms/sms.pug';
		await next();
	})
	.put('/', async (ctx, next) => {
		const {db, body, nkcModules} = ctx;
		const {checkString} = nkcModules.checkData;
		const {smsSettings} = body;
		const reg = /^\**?$/;
    const smsSettingsDB = await db.SettingModel.findOnly({_id: 'sms'});
    const {templates, restrictedNumber, appId, appKey, smsSign, platform} = smsSettings;
    if(!['aliCloud', 'tencentCloud', 'alidayu'].includes(platform)) ctx.throw(400, `短信平台错误 platform: ${platform}`);
    checkString(appId, {
      name: "App ID",
      minLength: 1
    });
    checkString(appKey, {
      name: "APP Key",
      minLength: 1
    });
    checkString(smsSign, {
      name: "短信签名",
      minLength: 1
    });

    const obj  = {
      "c.appId": appId,
      "c.smsSign": smsSign,
      "c.platform": platform,
    };
    if(!reg.test(appKey)) {
      obj["c.appKey"] = appKey;
    }

    for(const template of templates) {
      if (template.id === '') ctx.throw(400, template.name + '的模板ID不能为空');
      if (template.validityPeriod === '') ctx.throw(400, template.name + '的有效时间不能为空');
      if (template.validityPeriod <= 0) ctx.throw(400, template.name + '的有效时间必须大于0');
      if (template.sameIpOneDay === '') ctx.throw(400, template.name + '的IP次数限制不能为空');
      if (template.sameIpOneDay <= 0) ctx.throw(400, template.name + '的IP次数限制必须大于0');
      if (template.sameMobileOneDay === '') ctx.throw(400, template.name + '的手机号码次数限制不能为空');
      if (template.sameMobileOneDay <= 0) ctx.throw(400, template.name + '的手机号码次数限制必须大于0');
    }

    obj["c.templates"] = templates;
    obj["c.restrictedNumber"] = restrictedNumber;

    await smsSettingsDB.updateOne({
      $set: obj
    });
    await db.SettingModel.saveSettingsToRedis("sms");
    await next();
  })
  // .post('/restricted', async (ctx, next) => {
  //   const {body, db} = ctx
  //   const {code} = body
  //   const smsSettingsDB = await db.SettingModel.findOnly({_id: 'sms'});
  //   if (smsSettingsDB.c.restrictedNumber[code]) {
  //     ctx
  //   }
  // })
  .post('/test', async (ctx, next) => {
    const {body, nkcModules} = ctx;
    const {name, nationCode, mobile, content} = body;
    if(!name) ctx.throw(400, '测试类型不能为空');
    if(!nationCode) ctx.throw(400, '测试手机国际区号不能为空');
    if(!mobile) ctx.throw(400, '测试手机号码不能为空');
    if(!content) ctx.throw(400, "自定义验证码不能为空");
    const {sendMessage} = nkcModules;
    await sendMessage({
      type: name,
      code: content,
      mobile: mobile,
      nationCode: nationCode || '86'
    });
    await next();
  });
module.exports = smsRouter;
