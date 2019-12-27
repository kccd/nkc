const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const regSettings= await db.SettingModel.findById("register");
    // const regSettings = await db.SettingModel.getSettings("register");
    data.regSettings = regSettings.c;
    const {defaultSubscribeForumsId} = data.regSettings;
    data.selectedForums = await db.ForumModel.find({fid: {$in: defaultSubscribeForumsId}});
    ctx.template = "experimental/settings/register/register.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {body, db} = ctx;
    let {defaultSubscribeForumsId, recommendUsers} = body;
    const forums = await db.ForumModel.find({fid: {$in: defaultSubscribeForumsId}});
    defaultSubscribeForumsId = [];
    let {
      digestThreadsCount,
      threadCount,
      postCount,
      xsf,
      lastVisitTime
    } = recommendUsers;
    recommendUsers.usersCount = parseInt(recommendUsers.usersCount);
    recommendUsers.digestThreadsCount = parseInt(recommendUsers.digestThreadsCount);
    recommendUsers.threadCount = parseInt(recommendUsers.threadCount);
    recommendUsers.postCount = parseInt(recommendUsers.postCount);
    recommendUsers.xsf = parseInt(recommendUsers.xsf);
    recommendUsers.lastVisitTime = parseInt(recommendUsers.lastVisitTime);
    if(recommendUsers.usersCount <= 0) ctx.throw(400, "推荐用户数量不能小于1");
    if(recommendUsers.digestThreadsCount < 0) ctx.throw(400, "加精文章数量不能小于0");
    if(recommendUsers.threadCount < 0) ctx.throw(400, "文章总数不能小于0");
    if(recommendUsers.postCount < 0) ctx.throw(400, "回复总数不能小于0");
    if(recommendUsers.xsf < 0) ctx.throw(400, "学术分不能小于0");
    if(recommendUsers.lastVisitTime <= 0) ctx.throw(400, "最后活动时间不能小于1天");

    await Promise.all(forums.map(async f => {
      const childrenForums = await f.extendChildrenForums();
      if(childrenForums.length !== 0) {
        ctx.throw(400, `${f.displayName}专业下存在其他专业，无法设置默认关注。`);
      }
      defaultSubscribeForumsId.push(f.fid);
    }));
    await db.SettingModel.updateOne({_id: 'register'}, {
      $set: {
        "c.defaultSubscribeForumsId": defaultSubscribeForumsId,
        "c.recommendUsers": recommendUsers
      }
    });
    await db.SettingModel.saveSettingsToRedis("register");
    await next();
  });
module.exports = router;