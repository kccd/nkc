const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, state} = ctx;
    data.documentPostSettings = await db.SettingModel.getSettings('documentPost');
    const sources = await db.DocumentModel.getDocumentSources();
    data.sources = [];
    for(const sourceName in sources) {
      const sourceValue = sources[sourceName];
      const name = state
        .lang('documentSources', sourceValue);
      data.sources.push({
        name,
        type: sourceValue
      });
    }
    data.roleList = await db.RoleModel.getCertList(['default', 'visitor']);
    ctx.template = 'experimental/settings/documentPost/documentPost.pug';
    await next();
  });
module.exports = router;