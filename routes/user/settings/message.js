const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    const {user} = data;
    const blackList = await db.MessageBlackListModel.find({
      uid: user.uid
    }).sort({toc: -1});

    const blackListUsers = [];
    for(const b of blackList) {
      const u = await db.UserModel.findOne({uid: b.tUid});
      if(u) blackListUsers.push(u);
    }
    data.blackListUsers = blackListUsers;
    ctx.template = "/user/settings/message/message.pug";
    await next();
  });
module.exports = router;