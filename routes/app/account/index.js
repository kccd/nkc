const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, nkcModules, state, db} = ctx;
    const {user} = data;
    data.userInfo = null;
    if(state.uid) {
      const userCode = await db.UserModel.getCode(state.uid);
      const extendedUser = await db.UserModel.extendUserInfo(user);
      const userGrade = extendedUser.grade;
      data.userInfo = {
        uid: user.uid,
        username: user.username,
        avatarUrl: nkcModules.tools.getUrl('userAvatar', user.avatar),
        certsName: extendedUser.info.certsName,
        code: userCode,
        xsf: user.xsf,
        followers: 0,
        following: 0,
        gradeId: userGrade._id,
        gradeName: userGrade.displayName,
        gradeIconUrl: nkcModules.tools.getUrl('gradeIcon', userGrade._id),
        gradeColor: userGrade.color,
      };
    }
    await next();
  })
module.exports = router;
