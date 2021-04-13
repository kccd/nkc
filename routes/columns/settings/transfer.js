const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {data, db} = ctx;
    ctx.template = "columns/settings/transfer.pug";
    const columnSettings = await db.SettingModel.findById("column");
    data.columnSettings = columnSettings.c;
    await next();
  })
  .post("/", async (ctx, next) => {
    const {body, data, db} = ctx;
    const {column, user} = data;
    const {targetUid, password} = body;
    const usersPersonal = await db.UsersPersonalModel.findOne({uid: user.uid});
    await usersPersonal.ensurePassword(password);
    if(targetUid === user.uid) ctx.throw(400, "专栏转让失败！无法转让专栏给自己");
    if(!await db.UserModel.ensureApplyColumnPermission(targetUid)) ctx.throw(400, "专栏转让失败！因为目标用户没有权限开设专栏");
    const c = await db.UserModel.getUserColumn(targetUid);
    if(c) ctx.throw(400, "专栏转让失败！因为目标用户已经开设有专栏");
    await column.updateOne({
      uid: targetUid,
      $addToSet: {
        userLogs: {
          uid: targetUid,
          time: new Date()
        }
      }
    });
    const columnPosts = await db.ColumnPostModel.find({columnId: column._id});
    for(const columnPost of columnPosts) {
      const post = await db.PostModel.findOne({pid: columnPost.pid});
      if(!post) continue;
      if(post.uid === targetUid) {
        await columnPost.updateOne({
          from: "own"
        });
      } else {
        await columnPost.updateOne({
          from: "contribute"
        });
      }
    }
    await next();
  });
module.exports = router;