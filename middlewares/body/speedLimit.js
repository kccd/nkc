const {ThrottleGroup} = require("stream-throttle");
const onFinished = require("on-finished");
const destroy = require("destroy");
let allSpeedLimit;
module.exports = async (ctx) => {
  const {tg, db} = ctx;
  // 全局限速
  const downloadSettings = await db.SettingModel.getSettings('download');
  const newAllSpeed = downloadSettings.allSpeed;

  if (!allSpeedLimit || allSpeedLimit.speed !== newAllSpeed) {
    allSpeedLimit = {
      tg: new ThrottleGroup({rate: newAllSpeed * 1024}),
      speed: newAllSpeed
    };
  }

  if (tg) {
    const tgThrottle = tg.throttle();
    const globalTgThrottle = allSpeedLimit.tg.throttle();
    ctx.body = ctx.body.pipe(tgThrottle).pipe(globalTgThrottle);
    onFinished(ctx.res, (err) => {
      destroy(globalTgThrottle);
      destroy(tgThrottle);
      destroy(ctx.body);
    });
  } else {
    const globalTgThrottle = allSpeedLimit.tg.throttle();
    ctx.body = ctx.body.pipe(allSpeedLimit.tg.throttle());
    onFinished(ctx.res, (err) => {
      destroy(globalTgThrottle);
      destroy(ctx.body);
    });
  }
};