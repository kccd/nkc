const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  const { data, state, nkcModules } = ctx;
  const accountInfo = {
    logged: false,
    name: '',
    desc: '',
    avatar: '',
    uid: '',
  };
  if (state.uid) {
    accountInfo.logged = true;
    accountInfo.name = data.user.username;
    accountInfo.desc = data.user.description;
    accountInfo.uid = state.uid;
    accountInfo.avatar = nkcModules.tools.getUrl(
      'userAvatar',
      data.user.avatar,
    );
  }
  ctx.apiData = {
    accountInfo,
  };
  await next();
});
module.exports = router;
