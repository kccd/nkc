const Router = require('koa-router');
const smsRouter = new Router();
smsRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		if(ctx.get('FROM') !== 'nkcAPI') {
      ctx.template = 'experimental/settings/sms.pug';
    } else {
      data.smsSettings = (await db.SettingModel.findOnly({_id: 'sms'})).c;
    }
		await next();
	})
	.patch('/', async (ctx, next) => {
		const {db, body} = ctx;
		const {smsSettings} = body;
		const smsSettingsDB = await db.SettingModel.findOnly({_id: 'sms'});
    if(!smsSettings.appId) return screenTopWarning('appId不能为空');
    if(!smsSettings.appKey) return screenTopWarning('appKey不能为空');
    if(!smsSettings.smsSign) return screenTopWarning('短信签名不能为空');
    for(const template of smsSettings.templates) {
      if (smsSettings.status) {
        if (template.id === '') return screenTopWarning(template.name + '的模板ID不能为空');
        if (template.validityPeriod === '') return screenTopWarning(template.name + '的有效时间不能为空');
        if (template.validityPeriod <= 0) return screenTopWarning(template.name + '的有效时间必须大于0');
        if (template.sameIpOneDay === '') return screenTopWarning(template.name + '的IP次数限制不能为空');
        if (template.sameIpOneDay <= 0) return screenTopWarning(template.name + '的IP次数限制必须大于0');
        if (template.sameMobileOneDay === '') return screenTopWarning(template.name + '的手机号码次数限制不能为空');
        if (template.sameMobileOneDay <= 0) return screenTopWarning(template.name + '的手机号码次数限制必须大于0');
      }
    }
    await smsSettingsDB.update({c: smsSettings});
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