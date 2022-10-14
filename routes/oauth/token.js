const router = require('koa-router')();
router
  .post('/creation', async (ctx, next) => {
    const {body, db, data} = ctx;
    const {appId, secret, operation} = body;
    const app = await db.OAuthAppModel.getAppBySecret(appId, secret);
    await app.ensurePermission(operation);
    data.token = await db.OAuthTokenModel.createToken(appId, operation);
    await next();
  })
  .post('/content', async (ctx, next) => {
    const {db, body, data} = ctx;
    const {appId, secret, token} = body;
    const app = await db.OAuthAppModel.getAppBySecret(appId, secret);
    const tokenData = await db.OAuthTokenModel.getTokenByTokenString(token);
    if(app._id !== tokenData.appId) {
      ctx.throw(403, '权限不足');
    }
    await tokenData.verifyTokenAfterAuthorize();
    await tokenData.useToken();
    data.operation = tokenData.operation;
    data.content = await tokenData.getContent();
    await next();
  });
module.exports = router;
