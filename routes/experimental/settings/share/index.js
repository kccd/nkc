const Router = require('koa-router');
const shareRouter = new Router();
shareRouter
  .use('/', async (ctx, next) => {
    ctx.data.shareTypes = {
      forum: '专业',
      user: '用户',
      post: '文章、回复或评论',
      column: '专栏',
      fund: '基金',
      fundForm: '基金申请',
      activity: '活动'
    };
    await next();
  })
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    data.shareSettings = await db.SettingModel.getSettings('share');
    ctx.template = 'experimental/settings/share/share.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, db, nkcModules, data} = ctx;
    const {shareTypes} = data;
    const {shareSettings} = body;
    const {checkNumber} = nkcModules.checkData;
    const checkValue = (type) => {
      const name = shareTypes[type];
      const obj = shareSettings[type];
      checkNumber(obj.countLimit, {
        name: `分享${name}次数限制`,
        min: 1,
      });
      checkNumber(obj.timeLimit, {
        name: `分享${name}时间限制`,
        min: 0.01,
        fractionDigits: 2
      });
      obj.status = !!obj.status;
    };
    const updateObj = {};
    for(const type in shareSettings) {
      if(!shareSettings.hasOwnProperty(type)) continue;
      checkValue(type);
      const {status, countLimit, timeLimit}  = shareSettings[type];
      updateObj[type] = {
        status, countLimit, timeLimit
      };
    }
    await db.SettingModel.updateOne({_id: 'share'}, {
      $set: {
        c: updateObj
      }
    });
    await db.SettingModel.saveSettingsToRedis('share');
    await next();
  });
module.exports = shareRouter;
