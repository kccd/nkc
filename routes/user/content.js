const router = require("koa-router")();
router
  // 动态
  .get("/moment", async (ctx, next) => {
    await next();
  })
  // 回复
  .get("/post", async (ctx, next) => {
    await next();
  })
  // 文章
  .get("/thread", async (ctx, next) => {
    await next();
  })
  // 关注
  .get("/follow", async (ctx, next) => {
    const { data, db, query, params, state, nkcModules, permission } = ctx;
    const { uid } = params;
    const { pageSettings } = state;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    const q = {
      uid: targetUser.uid,
      type: "user",
      cancel: false
    };
    const count = await db.SubscribeModel.countDocuments(q);
    paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.userCardUserList
    );
    if (!data.noPromission) {
      const subs = await db.SubscribeModel.find(q, { tUid: 1 })
        .sort({ toc: -1 })
        .skip(paging.start)
        .limit(paging.perpage);
      data.users = await db.UserModel.find({
        uid: { $in: subs.map(s => s.tUid) }
      });
      data.users = await db.UserModel.extendUsersInfo(data.users);
      delete data.user;
      delete data.targetUser;
      delete data.operationId;
    }
    await next();
  })
  // 取消关注
  .del("/follow", async (ctx, next) => {
    await next();
  })
  // 粉丝
  .get("/fans", async (ctx, next) => {
    const { data, db, query, params, state, nkcModules, permission } = ctx;
    const { uid } = params;
    const { pageSettings } = state;
    const { page = 0 } = query;
    const targetUser = await db.UserModel.findOnly({ uid });
    const q = {
      tUid: targetUser.uid,
      type: "user",
      cancel: false
    };
    const count = await db.SubscribeModel.countDocuments(q);
    paging = nkcModules.apiFunction.paging(
      page,
      count,
      pageSettings.userCardUserList
    );
    if (!data.noPromission) {
      const subs = await db.SubscribeModel.find(q, { uid: 1 })
        .sort({ toc: -1 })
        .skip(paging.start)
        .limit(paging.perpage);
      data.users = await db.UserModel.find({
        uid: { $in: subs.map(s => s.uid) }
      });
      data.users = await db.UserModel.extendUsersInfo(data.users);
      Object.property.filterObject = function(allowKey) {
        let newObj = {};
        for (let key in this) {
          if (this.hasOwnProperty(key)) {
            if (allowKey.includes(key)) {
              newObj[key] = this[key];
            }
          }
        }
        return newObj;
      };
      let newData = [];
      for (let obj of data.users) {
        
      }
      delete data.user;
      delete data.targetUser;
      delete data.operationId;
    }
    await next();
  })
  // 关注粉丝
  .post("/fans", async (ctx, next) => {
    await next();
  })
  // 取消关注
  .del("/fans", async (ctx, next) => {
    await next();
  });
module.exports = router;
