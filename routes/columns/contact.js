const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {user, column} = data;
    if(user.uid !== column.uid) ctx.throw(403, "权限不足");
    if(column.contacted) ctx.throw(400, "您已经通知过管理员了，请等待管理员处理");
    if(
      !column.noticeDisabled &&
      !column.blocksDisabled &&
      !column.otherLinksDisabled
    ) ctx.throw(403, "专栏中没有被屏蔽的信息，请刷新");
    const columnSettings = await db.SettingModel.findById("column");
    const adminCertsId = columnSettings.c.adminCertsId;
    const users = await db.UserModel.find({certs: {$in: adminCertsId}}, {uid: 1});
    for(const u of users) {
      const message = db.MessageModel({
        _id: await db.SettingModel.operateSystemID("messages", 1),
        ty: "STU",
        port: ctx.port,
        ip: ctx.address,
        r: u.uid,
        c: {
          type: "columnContactAdmin",
          columnId: column._id
        }
      });
      await message.save();
      await ctx.nkcModules.socket.sendMessageToUser(message._id);
    }
    await column.updateOne({contacted: true});
    await next();
  });
module.exports = router;