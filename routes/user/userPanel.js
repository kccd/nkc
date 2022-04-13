const Router = require("koa-router");
const router = new Router();
router
    .get('/userPanel', async (ctx, next) => {
      const {data, db, state, query, params, permission} = ctx;
      const {targetUser, user} = data;
      const panelPermission = {
          unBannedUser:false,
          bannedUser:false,
          clearUserInfo:false,
          hideUserHome:false,
          visitUserTransaction:false,
          violationRecord:false,
          getUserOtherAccount:false,
          viewUserCode:false,

      };
      Object.keys(panelPermission).forEach((key) => {
          if(permission(key)) panelPermission[key] = true;
      })
      data.panelPermission = panelPermission;

      const match = {
        uid: user.uid
      };
      // const count = await db.BlacklistModel.countDocuments(match);
      // const paging = nkcModules.apiFunction.paging(page, count);
      const bl = await db.BlacklistModel.find(match).sort({toc: -1});
      const usersId = bl.map(b => {
        return b.tUid
      });
      const users = await db.UserModel.find({uid: usersId});
      const usersBlUid = users.map(b => {
        return b.uid
      });
      data.usersBlUid = usersBlUid;
      await next();
    })
module.exports = router;