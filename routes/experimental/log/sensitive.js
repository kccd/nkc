const router = require('koa-router')();
const {
  sensitiveCheckerService,
} = require('../../../services/sensitive/sensitiveChecker.service');
router
  .get('/', async (ctx, next) => {
    const { query, data } = ctx;
    const { page = 0 } = query;
    const { logs, paging } =
      await sensitiveCheckerService.getSensitiveCheckerLogs(page);
    data.logs = logs;
    data.paging = paging;
    ctx.template = 'experimental/log/sensitive/sensitive.pug';
    await next();
  })
  .get('/:id', async (ctx, next) => {
    const { params, data } = ctx;
    const { id } = params;
    const { log, paging, results } =
      await sensitiveCheckerService.getSensitiveCheckerLogResultById(id);
    data.log = log;
    data.paging = paging;
    data.results = results;
    ctx.template = 'experimental/log/sensitive/sensitiveDetail.pug';
    await next();
  })
  .post('/:id', async (ctx, next) => {
    await next();
  })
  .post('/', async (ctx, next) => {
    const { body } = ctx;
    const { type, targets, logId } = body;
    switch (type) {
      case 'clearInfo': {
        await sensitiveCheckerService.clearSensitiveContentByTargetIds({
          ip: ctx.address,
          port: ctx.port,
          targets,
        });
        break;
      }
      case 'clearAllInfo': {
        await sensitiveCheckerService.clearSensitiveContentByLogId({
          ip: ctx.address,
          port: ctx.port,
          logId,
        });
        break;
      }
    }
    await next();
  });

module.exports = router;
