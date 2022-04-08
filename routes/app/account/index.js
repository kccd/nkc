const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {data, nkcModules, state} = ctx;
    const {user} = data;
    data.userInfo = null;
    if(state.uid) {
      data.userInfo = {
        uid: user.uid,
        username: user.username,
        avatarUrl: nkcModules.tools.getUrl('userAvatar', user.avatar)
      };
    }
    await next();
  })
module.exports = router;
