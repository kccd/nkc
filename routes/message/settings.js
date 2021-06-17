const Router = require('koa-router');
const settingsRouter = new Router();
settingsRouter
  .get('/', async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    data.grades = await db.UsersGradeModel.find({}, {_id: 1, displayName: 1}).sort({_id: 1});
    const {messageSettings} = await db.UsersGeneralModel.findOne({uid: user.uid}, {messageSettings: 1});
    data.messageSettings = messageSettings;
    await next();
  })
  .put('/', async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {beep, onlyReceiveFromFriends, messageSettings, limit, allowAllMessageWhenSale} = body;
    const usersGeneral = await db.UsersGeneralModel.findOnly({uid: user.uid});
    if(messageSettings) {
      await usersGeneral.updateOne({
        messageSettings
      });
    } else {
      if(
        limit.status &&
        !limit.timeLimit &&
        !limit.digestLimit &&
        !limit.xsfLimit &&
        !limit.volumeA &&
        !limit.volumeB &&
        Number(limit.gradeLimit) < 2
      ) ctx.throw(400, "请至少勾选一项防骚扰设置");
      await usersGeneral.updateOne({
        'messageSettings.beep': beep,
        'messageSettings.onlyReceiveFromFriends': onlyReceiveFromFriends,
        "messageSettings.limit": limit,
        'messageSettings.allowAllMessageWhenSale': allowAllMessageWhenSale
      });
    }
    await next();
  });
module.exports = settingsRouter;
