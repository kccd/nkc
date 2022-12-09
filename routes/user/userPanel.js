const Router = require("koa-router");
const router = new Router();
router
    .get('/', async (ctx, next) => {
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
      if(data.user) {
        data.userSubscribeUsersId = await db.SubscribeModel.getUserSubUsersId(data.user.uid);
      }
      data.panelPermission = panelPermission;
      await next();
    })
module.exports = router;
