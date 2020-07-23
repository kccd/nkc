const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const regSettings= await db.SettingModel.findById("register");
    data.regSettings = regSettings.c;
    const {defaultSubscribeForumsId} = data.regSettings;
    data.selectedForums = await db.ForumModel.find({fid: {$in: defaultSubscribeForumsId}});
    ctx.template = "experimental/settings/register/register.pug";
    await next();
  })
  .put("/", async (ctx, next) => {
    const {body, db, nkcModules} = ctx;
    let {defaultSubscribeForumsId, regSettings} = body;
    const {
      recommendUsers, verifyMobile, verifyEmail, verifyPassword,
      mobileCountLimit, emailCountLimit,
      noticeForDestroy
    } = regSettings;
    const {checkNumber, checkString} = nkcModules.checkData;
    const forums = await db.ForumModel.find({fid: {$in: defaultSubscribeForumsId}});
    defaultSubscribeForumsId = [];
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
    checkNumber(mobileCountLimit, {
      min: 1,
      name: "手机号最大使用次数"
    });
    checkNumber(emailCountLimit, {
      name: "邮箱最大使用次数",
      min: 1
    });
    checkString(noticeForDestroy, {
      name: "账号注销说明",
      minLength: 1,
      maxLength: 5000
    });
    await db.SettingModel.updateOne({_id: 'register'}, {
      $set: {
        "c.defaultSubscribeForumsId": defaultSubscribeForumsId,
        "c.recommendUsers": recommendUsers,
        "c.verifyMobile": !!verifyMobile,
        "c.verifyEmail": !!verifyEmail,
        "c.verifyPassword": !!verifyPassword,
        "c.mobileCountLimit": mobileCountLimit,
        "c.emailCountLimit": emailCountLimit,
        "c.noticeForDestroy": noticeForDestroy
      }
    });
    await db.SettingModel.saveSettingsToRedis("register");
    await next();
  });
module.exports = router;
