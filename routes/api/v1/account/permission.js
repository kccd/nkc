const Router = require('koa-router');
const { OnlyUnbannedUser } = require('../../../../middlewares/permission');
const router = new Router();

const operationRelationType = {
  and: 'and',
  or: 'or',
};

router.get('/', OnlyUnbannedUser(), async (ctx, next) => {
  const { query } = ctx;
  const { type = operationRelationType.and, operations = '' } = query;
  const operationsId = operations.split(',').filter((operation) => !!operation);
  let permission = false;
  if (type === operationRelationType.and) {
    permission = ctx.permissionsAnd(operationsId);
  } else if (type === operationRelationType.or) {
    permission = ctx.permissionsOr(operationsId);
  } else {
    ctx.throw(400, 'Invalid operation type');
  }

  ctx.apiData = {
    permission,
  };
  await next();
});

module.exports = router;
