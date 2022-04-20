const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, nkcModules, state, db} = ctx;
    const {user} = data;
    data.userInfo = null;
    if(state.uid) {
      const userCodes = await db.UserModel.getCode(state.uid);
      const extendedUser = await db.UserModel.extendUserInfo(user);
      const userGrade = extendedUser.grade;

      const subUsersId = await db.SubscribeModel.getUserSubUsersId(state.uid);
      const fansId = await db.SubscribeModel.getUserFansId(state.uid);

      data.userInfo = {
        uid: user.uid,
        username: user.username,
        avatarUrl: nkcModules.tools.getUrl('userAvatar', user.avatar),
        homeUrl: nkcModules.tools.getUrl('userHome', user.uid),
        certsName: extendedUser.info.certsName,
        codes: userCodes,
        xsf: user.xsf,
        followers: fansId.length,
        following: subUsersId.length,
        gradeId: userGrade._id,
        gradeName: userGrade.displayName,
        gradeIconUrl: nkcModules.tools.getUrl('gradeIcon', userGrade._id),
        gradeColor: userGrade.color,
      };
    }
    await next();
  })
module.exports = router;
