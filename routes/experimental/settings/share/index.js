const Router = require('koa-router');
const shareRouter = new Router();
shareRouter
  .get('/', async (ctx, next) => {
    const {data, db} = ctx;
    const shareSettings = await db.SettingModel.getSettings('share');
    const shares = [];
    for(const shareType in shareSettings) {
      const {status, countLimit, timeLimit} = shareSettings[shareType];
      const name = await db.ShareModel.getShareNameByType(shareType);
      shares.push({
        type: shareType,
        name,
        status,
        countLimit,
        timeLimit
      });
    }
    data.shares = shares;
    ctx.template = 'experimental/settings/share/share.pug';
    await next();
  })
  .put('/', async (ctx, next) => {
    const {body, db, nkcModules} = ctx;
    const {shares} = body;
    const {checkNumber} = nkcModules.checkData;
    const checkValue = async (share) => {
      const {type, countLimit, timeLimit} = share;
      const name = await db.ShareModel.getShareNameByType(type);

      checkNumber(countLimit, {
        name: `分享${name}次数限制`,
        min: 1,
      });
      checkNumber(timeLimit, {
        name: `分享${name}时间限制`,
        min: 0.01,
        fractionDigits: 2
      });
      share.status = !!share.status;
    };
    const updateObj = {};
    for(const share of shares) {
      await checkValue(share);
      const {type, status, countLimit, timeLimit}  = share;
      updateObj[`c.${type}.status`] = status;
      updateObj[`c.${type}.countLimit`] = countLimit;
      updateObj[`c.${type}.timeLimit`] = timeLimit;
    }
    await db.SettingModel.updateOne({_id: 'share'}, {
      $set: updateObj
    });
    await db.SettingModel.saveSettingsToRedis('share');
    await next();
  });
module.exports = shareRouter;
