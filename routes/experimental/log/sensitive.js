const router = require('koa-router')();
const { OnlyOperation } = require('../../../middlewares/permission');
const {
  sensitiveCheckerService,
} = require('../../../services/sensitive/sensitiveChecker.service');
const { userBanService } = require('../../../services/user/userBan.service');
const { Operations } = require('../../../settings/operations');
router
  .get(
    '/',
    OnlyOperation(Operations.experimentalFilterLogs),
    async (ctx, next) => {
      const { query, data } = ctx;
      const { page = 0 } = query;
      const { logs, paging } =
        await sensitiveCheckerService.getSensitiveCheckerLogs(page);
      data.logs = logs;
      data.paging = paging;
      ctx.template = 'experimental/log/sensitive/sensitive.pug';
      await next();
    },
  )
  .get(
    '/:id',
    OnlyOperation(Operations.experimentalFilterLogs),
    async (ctx, next) => {
      const { params, data, query } = ctx;
      const { page = 0 } = query;
      const { id } = params;
      const { log, paging, results } =
        await sensitiveCheckerService.getSensitiveCheckerLogResultById(
          id,
          page,
        );
      data.log = log;
      data.paging = paging;
      data.results = results;
      ctx.template = 'experimental/log/sensitive/sensitiveDetail.pug';
      await next();
    },
  )
  .post(
    '/:id',
    OnlyOperation(Operations.experimentalFilterLogs),
    async (ctx, next) => {
      await next();
    },
  )
  .post(
    '/',
    OnlyOperation(Operations.experimentalFilterLogs),
    async (ctx, next) => {
      const { body } = ctx;
      const { type, targets, logId, userIds, banned, reason = '' } = body;
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
        case 'banUsers': {
          if (banned) {
            await userBanService.banUsersByUserIds({
              adminId: ctx.state.uid,
              userIds,
              reason,
              ip: ctx.address,
              port: ctx.port,
            });
          } else {
            await userBanService.unBanUsersByUserIds({
              adminId: ctx.state.uid,
              userIds,
              reason,
              ip: ctx.address,
              port: ctx.port,
            });
          }
        }
      }
      await next();
    },
  );

module.exports = router;
