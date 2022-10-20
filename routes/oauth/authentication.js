const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, data, nkcModules, state} = ctx;
    const {t: token} = query;
    const {getUrl} = nkcModules.tools;
    const tokenData = await db.OAuthTokenModel.getTokenByTokenString(token);
    await tokenData.verifyTokenBeforeAuthorize();
    const app = await db.OAuthAppModel.getAppById(tokenData.appId);
    data.oauthInfo = {
      appId: app._id,
      appIcon: getUrl('OAuthAppIcon', app.icon),
      appName: app.name,
      appHome: app.home,
      operations: [
        {
          type: tokenData.operation,
          name: state.lang('oauth', tokenData.operation)
        }
      ],
      token,
    };
    ctx.remoteTemplate = 'oauth/authentication/authentication.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, state, db, data} = ctx;
    const {token, approved} = body;
    if(!state.uid) {
      ctx.throw(403, `请先登录`);
    }
    const tokenData = await db.OAuthTokenModel.getTokenByTokenString(token);
    await tokenData.verifyTokenBeforeAuthorize();
    if(approved) {
      await tokenData.authorizeToken(state.uid);
    } else {
      await tokenData.useToken();
    }
    const app = await db.OAuthAppModel.getAppById(tokenData.appId);
    data.url = `${app.callback}?o=${tokenData.operation}&t=${token}`;
    await next();
  });
module.exports = router;
