const router = require('koa-router')();
const translate = require("../../../../nkcModules/translate");
const {languageNames} = require("../../../../nkcModules/language");
const creationRouter = require('./creation');
const manageRouter = require('./manage');
const appOperations = {
  signIn: 'signIn',
};
router
  .use('/', async (ctx, next) => {
    const {db} = ctx;
    // ctx.template = 'experimental/settings/oauth/oauthManage.pug';
    ctx.data.type = 'oauth';
    const appStatus = await db.OAuthAppModel.getAppStatus();
    const appOperations = await db.OAuthAppModel.getAppOperations();
    const oauthStatus = {};
    const oauthOperations = {};
    for (let appStatusKey in appStatus) {
      oauthStatus[appStatusKey] = translate(languageNames.zh_cn,'oauth',appStatus[appStatusKey])
    }
    for (let appOperationKey in appOperations) {
      oauthOperations[appOperationKey] = translate(languageNames.zh_cn,'oauth',appOperations[appOperationKey])
    }
    ctx.data.oauthStatus = oauthStatus;
    ctx.data.oauthOperations = oauthOperations;
    await next();
  })
  .use('/creation', creationRouter.routes(), creationRouter.allowedMethods())
  .use('/manage', manageRouter.routes(), manageRouter.allowedMethods())
module.exports = router;
