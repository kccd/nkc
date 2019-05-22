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
  .patch("/", async (ctx, next) => {
    const {body, db} = ctx;
    let {defaultSubscribeForumsId} = body;
    const forums = await db.ForumModel.find({fid: {$in: defaultSubscribeForumsId}});
    defaultSubscribeForumsId = [];
    await Promise.all(forums.map(async f => {
      const childrenForums = await f.extendChildrenForums();
      if(childrenForums.length !== 0) {
        ctx.throw(400, `${f.displayName}专业下存在其他专业，无法设置默认关注。`);
      }
      defaultSubscribeForumsId.push(f.fid);
    }));
    await db.SettingModel.updateOne({_id: 'register'}, {
      $set: {
        "c.defaultSubscribeForumsId": defaultSubscribeForumsId
      }
    });
    await next();
  });
module.exports = router;