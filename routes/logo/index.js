const router = require('koa-router')();
router
  .get('/:type', async (ctx, next) => {
    const {params, settings, nkcModules} = ctx;
    const {statics} = settings;
    const type = params.type.toUpperCase();
    if(!['ICO', 'MD', 'SM', 'LG'].includes(type)) {
      ctx.throw(400, `type 类型错误 type: ${type}`);
    }
    const defaultFilePath = statics[`defaultLogo${type}`];
    let targetFilePath = statics[`logo${type}`];
    if(!await nkcModules.file.access(targetFilePath)) {
      targetFilePath = defaultFilePath;
    }
    ctx.filePath = targetFilePath;
    await next();
  })
module.exports = router;