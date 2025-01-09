const Router = require('koa-router');
const {
  fundOperationService,
} = require('../../../../services/fund/FundOperation.service');
const mongoose = require('mongoose');
const {
  fundOperationStatus,
  fundOperationTypes,
} = require('../../../../settings/fundOperation');
const auditRouter = require('./audit');
const {
  OnlyUser,
  OnlyUnbannedUser,
  OnlyOperation,
} = require('../../../../middlewares/permission');
const { Operations } = require('../../../../settings/operations');
const reportRouter = new Router();
reportRouter
  .use('/', OnlyUser(), async (ctx, next) => {
    const { applicationForm } = ctx.data;
    if (applicationForm.disabled) {
      ctx.throw(400, '申请表已被屏蔽');
    }
    if (!applicationForm.status.adminSupport) {
      ctx.throw(400, '暂未通过管理员复核，请通过后再试');
    }
    if (applicationForm.useless !== null) {
      ctx.throw(403, '申请表已被失效');
    }
    await next();
  })
  .get('/', OnlyUser(), async (ctx, next) => {
    const { data, state } = ctx;
    const { applicationForm, fund } = data;
    if (state.uid !== applicationForm.uid) {
      ctx.throw(403, `权限不足`);
    }
    data.nav = '项目进度';
    await applicationForm.extendReports(
      await fund.isFundRole(state.uid, 'admin'),
    );
    ctx.template = 'fund/report/report.pug';
    await next();
  })
  .post('/', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, body, state } = ctx;
    const { applicationForm } = data;
    const { c } = body;
    if (state.uid !== applicationForm.uid) {
      ctx.throw(403, `权限不足`);
    }
    if (applicationForm.status.completed) {
      ctx.throw(400, '项目已经结题，无法再提交报告');
    }

    await fundOperationService.createFundOperation({
      toc: Date.now(),
      uid: state.uid,
      formId: applicationForm._id,
      type: fundOperationTypes.report,
      desc: c,
      installment: 0,
      status: fundOperationStatus.normal,
      money: 0,
    });

    // await applicationForm.createReport('report', c, state.uid);
    await next();
  })

  .put(
    '/:reportId',
    OnlyOperation(Operations.deleteFundApplicationReport),
    async (ctx, next) => {
      const { data, db, body, params } = ctx;
      const { applicationForm, user } = data;
      const { disabled } = body;
      const { reportId } = params;
      if (
        !(await applicationForm.fund.ensureOperatorPermission('admin', user))
      ) {
        ctx.throw(403, '抱歉！您不是该基金项目的管理员，无法完成此操作。');
      }

      await db.FundOperationModel.updateOne(
        {
          _id: new mongoose.Types.ObjectId(reportId),
        },
        {
          $set: {
            status: disabled
              ? fundOperationStatus.disabled
              : fundOperationStatus.normal,
          },
        },
      );
      await next();
    },
  )
  .use('/audit', auditRouter.routes(), auditRouter.allowedMethods());
module.exports = reportRouter;
