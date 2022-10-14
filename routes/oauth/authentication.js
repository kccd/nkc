const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {query, db, data, nkcModules} = ctx;
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
        tokenData.operation
      ],
      token,
    };
    ctx.remoteTemplate = 'oauth/authentication/authentication.pug';
    await next();
  })
  .post('/', async (ctx, next) => {
    const {body, state, db, data} = ctx;
    const {token} = body;
    const tokenData = await db.OAuthTokenModel.getTokenByTokenString(token);
    await tokenData.verifyTokenBeforeAuthorize();
    await tokenData.authorizeToken(state.uid);
    const app = await db.OAuthAppModel.getAppById(tokenData.appId);
    data.url = `${app.callback}?o=${tokenData.operation}&t=${token}`;
    await next();
  });
module.exports = router;
