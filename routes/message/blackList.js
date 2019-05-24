const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {db, body, data} = ctx;
    const {user} = data;
    const {tUid, type} = body;
    const targetUser = await db.UserModel.findOne({uid: tUid});
    if(!targetUser) ctx.throw(404, "用户不存在");
    if(type === "add") {
      const blacklist = await db.MessageBlackListModel.findOne({
        uid: user.uid,
        tUid
      });
      if(blacklist) ctx.throw(400, "用户已被加入黑名单，请勿重复提交。");
      await db.MessageBlackListModel({
        _id: await db.SettingModel.operateSystemID("messageBlackLists", 1),
        uid: user.uid,
        tUid
      }).save();
    } else if(type === "remove") {
      await db.MessageBlackListModel.remove({
        uid: user.uid,
        tUid
      });
    }
    const blackList = await db.MessageBlackListModel.find({
      uid: user.uid
    }, {
      tUid: 1
    });
    data.blackListUid = blackList.map(b => b.tUid);
    await next();
  });
module.exports = router;