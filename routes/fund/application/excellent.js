const Router = require('koa-router');
const { OnlyOperation } = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
const excellentRouter = new Router();
excellentRouter.put(
  '/',
  OnlyOperation(Operations.fundApplicationFormExcellent),
  async (ctx, next) => {
    const { data, body, db } = ctx;
    const { applicationForm, user } = data;
    const { type } = body;
    applicationForm.status.excellent = type;
    if (!(await applicationForm.fund.ensureOperatorPermission('admin', user)))
      ctx.throw(403, '抱歉！您没有权限进行评优操作。');
    await applicationForm.save();
    await db.MessageModel.sendFundMessage(applicationForm._id, 'applicant');
    await next();
  },
);
module.exports = excellentRouter;
