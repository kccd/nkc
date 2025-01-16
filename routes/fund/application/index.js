const Router = require('koa-router');
// const auditRouter = require('./audit');
const remittanceRouter = require('./remittance');
const reportRouter = require('./report');
const completeRouter = require('./complete');
const voteRouter = require('./vote');
const commentRouter = require('./comment');
const settingsRouter = require('./settings');
const managementRouter = require('./manage');
const memberRouter = require('./member');
const excellentRouter = require('./excellent');
const disabledRouter = require('./disabled');
const refundRouter = require('./refund');
const applicationRouter = new Router();
const {
  fundOperationTypes,
  fundOperationStatus,
} = require('../../../settings/fundOperation');
const {
  fundOperationService,
} = require('../../../services/fund/FundOperation.service');
const {
  OnlyUser,
  OnlyOperation,
  OnlyUnbannedUser,
  Public,
} = require('../../../middlewares/permission');
const { Operations } = require('../../../settings/operations');
applicationRouter
  .use('/:_id', Public(), async (ctx, next) => {
    const { params, data, db, state } = ctx;
    const { _id } = params;
    const applicationForm = await db.FundApplicationFormModel.findOne({
      $or: [
        {
          code: _id,
        },
        {
          _id,
        },
      ],
    });
    if (!applicationForm) {
      ctx.throw(400, '未找到指定申请表。');
    }
    await applicationForm.extendApplicationFormBaseInfo(state.uid);
    const fund = applicationForm.fund;
    /*if(fund.history && ctx.method !== 'GET') {
			ctx.throw(400, '申请表所在基金已被设置为历史基金，申请表只供浏览。');
		}*/
    data.applicationForm = applicationForm;
    data.fund = fund;
    data.userFundRoles = await applicationForm.fund.getUserFundRoles(state.uid);
    await next();
  })

  // 申请表展示页
  .get('/:_id', Public(), async (ctx, next) => {
    const { data, db, state } = ctx;
    const { applicationForm } = data;
    const accessForumsId = await db.ForumModel.getAccessibleForumsId(
      data.userRoles,
      data.userGrade,
      data.user,
    );
    await applicationForm.extendApplicationFormInfo(state.uid, accessForumsId);
    data.targetUserInFundBlacklist = await db.FundBlacklistModel.inBlacklist(
      applicationForm.uid,
    );
    data.permissions = {
      modifyKcbRecordReason: ctx.permission('modifyKcbRecordReason'),
    };
    // 拓展历史版本所需要的信息
    if (applicationForm.tid && state.uid) {
      // 根据tid 获取文章的pid 以及获取访问用户是否具有查看历史版本的权限==》管理员
      const thread = await db.ThreadModel.findOnly(
        { tid: applicationForm.tid },
        { oc: 1 },
      );
      if (thread) {
        const post = await db.PostModel.findOnly({ pid: thread.oc });
        const isModerator = await db.PostModel.isModerator(
          state.uid,
          thread.oc,
        );
        if (
          post.tlm > post.toc &&
          ctx.permission('visitPostHistory') &&
          isModerator &&
          (!post.hideHistories || ctx.permission('displayPostHideHistories'))
        ) {
          data.userFundRoles.push('visitPostHistory');
          applicationForm.pid = thread.oc;
          // data.permissions.visitPostHistory =
          //   !post.hideHistories || ctx.permission('displayPostHideHistories')
          //     ? true
          //     : null;
        }
      }
    }
    // 定时超时放弃任务
    // await db.FundModel.modifyTimeoutApplicationForm();
    ctx.template = 'fund/applicationForm/applicationForm.pug';
    await next();
  })

  .del('/:_id', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, query, db } = ctx;
    const { user, applicationForm } = data;
    if (applicationForm.disabled) {
      ctx.throw(403, '抱歉！该申请表已被屏蔽。');
    }
    if (user.uid !== applicationForm.uid) {
      ctx.throw(403, '权限不足');
    }
    const { submitted, usersSupport, projectPassed, adminSupport, remittance } =
      applicationForm.status;
    const { type, c } = query;
    if (applicationForm.useless !== null) {
      ctx.throw(400, '申请表已失效，无法完成该操作。');
    }
    if (type === 'giveUp') {
      if (!c) {
        ctx.throw(400, '请输入放弃的原因。');
      }
      // if (user.uid !== applicationForm.uid) {
      //   ctx.throw(403, '权限不足');
      // }
      if (applicationForm.adminSupport) {
        ctx.throw(
          403,
          '已经通过审核的申请不能放弃，您可以点击结题按钮提前结题。',
        );
      }

      await fundOperationService.createFundOperation({
        uid: user.uid,
        formId: applicationForm._id,
        type: fundOperationTypes.applicantAbandoned,
        status: fundOperationStatus.normal,
        desc: c,
      });
      /*const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
      const newDocument = db.FundDocumentModel({
        _id: newId,
        uid: user.uid,
        applicationFormId: applicationForm._id,
        type: 'report',
        c: c,
      });
      await newDocument.save();*/
      applicationForm.useless = 'giveUp';
    } else if (type === 'delete') {
      if (submitted) {
        ctx.throw(
          400,
          '无法删除已提交的申请表，如需停止申请请点击放弃申请按钮。',
        );
      }
      applicationForm.useless = 'delete';
    } else if (type === 'refuse') {
      let remittanceError = false;
      for (let r of applicationForm.remittance) {
        if (r.status === false) {
          remittanceError = true;
          break;
        }
      }
      if (adminSupport && !remittanceError) {
        ctx.throw(400, '管理员复核已通过，且拨款没有出错，无法完成彻底拒绝。');
      }
      applicationForm.useless = 'refuse';
      await fundOperationService.createFundOperation({
        uid: user.uid,
        formId: applicationForm._id,
        type: fundOperationTypes.expertRefuse,
        status: fundOperationStatus.normal,
      });
      /*const newId = await db.SettingModel.operateSystemID('fundDocuments', 1);
      const newDocument = db.FundDocumentModel({
        _id: newId,
        uid: user.uid,
        applicationFormId: applicationForm._id,
        type: 'system',
        c: '被彻底拒绝',
        support: false,
      });
      await newDocument.save();*/
    } else if (type === 'withdraw') {
      if (applicationForm.remittance[0].status !== false) {
        ctx.throw(400, '无法完成该操作。');
      }
      applicationForm.lock.submitted = false;
      await applicationForm.updateOne({
        'lock.submitted': false,
      });
      return await next();
    } else {
      ctx.throw(400, '未知的操作类型。');
    }
    await applicationForm.save();
    await next();
  })
  .post('/:_id', OnlyUnbannedUser(), async (ctx, next) => {
    const { data, body } = ctx;
    const { operation } = body;
    const { applicationForm } = data;
    const { fund } = applicationForm;
    if (!(await fund.ensureOperatorPermission('admin', data.user))) {
      ctx.throw(403, '权限不足');
    }
    if (operation === 'restore' && applicationForm.useless === 'giveUp') {
      await applicationForm.updateOne({ useless: null });
    }
    await next();
  })
  // .use('/:_id/audit', auditRouter.routes(), auditRouter.allowedMethods())
  .use(
    '/:_id/remittance',
    remittanceRouter.routes(),
    remittanceRouter.allowedMethods(),
  )
  .use('/:_id/report', reportRouter.routes(), reportRouter.allowedMethods())
  .use(
    '/:_id/complete',
    completeRouter.routes(),
    completeRouter.allowedMethods(),
  )
  .use('/:_id/vote', voteRouter.routes(), voteRouter.allowedMethods())
  // .use('/:_id/comment', commentRouter.routes(), commentRouter.allowedMethods())
  .use(
    '/:_id/settings',
    settingsRouter.routes(),
    settingsRouter.allowedMethods(),
  )
  .use(
    '/:_id/manage',
    managementRouter.routes(),
    managementRouter.allowedMethods(),
  )
  .use('/:_id/member', memberRouter.routes(), memberRouter.allowedMethods())
  .use(
    '/:_id/excellent',
    excellentRouter.routes(),
    excellentRouter.allowedMethods(),
  )
  .use('/:_id/refund', refundRouter.routes(), refundRouter.allowedMethods())
  .use(
    '/:_id/disabled',
    disabledRouter.routes(),
    disabledRouter.allowedMethods(),
  )
  //屏蔽敏感信息
  .use('/', Public(), async (ctx, next) => {
    const { data, state } = ctx;
    const { applicationForm } = data;
    await applicationForm.hideApplicationFormInfoByUserId(
      state.uid,
      ctx.permission('displayFundApplicationFormSecretInfo'),
    );
    await next();
  });
module.exports = applicationRouter;
