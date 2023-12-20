const { Operations } = require('../../settings/operations');
const router = require('koa-router')();
router.get('/', async (ctx, next) => {
  const { db, data, params, state, permission } = ctx;
  const { mid } = params;
  const { user } = data;
  const { uid } = state;
  const { normal, deleted, disabled } = await db.MomentModel.getMomentStatus();
  const moment = await db.MomentModel.findOnly({ _id: mid });
  if (!moment) {
    ctx.throw(400, '未找到动态，请刷新');
  }
  let isAuthor = await moment.getAuthorByUid(uid);
  //判断当动态的状态不正常时用户是否具有操作权限
  if (moment.status !== normal) {
    if (!permission('review') && !isAuthor) {
      ctx.throw(400, '权限不足');
    }
  }
  const { stable: stableType } = await db.DocumentModel.getDocumentTypes();
  const { moment: momentSource } = await db.DocumentModel.getDocumentSources();
  if (moment.did) {
    const document = await db.DocumentModel.findOnly({
      did: moment.did,
      type: stableType,
      source: momentSource,
    });
    if (!document) {
      return ctx.throw(404, '未找到文章，请刷新后重试');
    }
  }
  if (!permission('review')) {
    if (moment.status !== normal && !isAuthor) {
      ctx.throw(401, '权限不足');
    }
  }
  const optionStatus = {
    type: 'moment',
    anonymous: null,
    complaint: null,
    reviewed: null,
    violation: null,
    blacklist: null,
    disable: null,
    delete: null,
    visibleMoment: null,
    editorMoment: null,
    visitHistory: null,
    ipInfo: null,
  };
  if (user) {
    //审核权限
    if (permission('review')) {
      optionStatus.reviewed = moment.status;
      if (moment.status !== disabled) {
        optionStatus.disable = true;
      }
    }
    if (isAuthor && moment.status !== deleted) {
      optionStatus.delete = true;
    }

    // 未匿名
    if (!moment.anonymous) {
      if (!isAuthor) {
        // 黑名单
        optionStatus.blacklist = await db.BlacklistModel.checkUser(
          uid,
          moment.uid,
        );
        //投诉权限
        optionStatus.complaint = permission('complaintPost') ? true : null;
        optionStatus.visibleMoment =
          !moment.parents.length && permission('setMomentVisibleOther')
            ? true
            : null;
        optionStatus.editorMoment =
          !moment.parents.length &&
          permission('editOtherUserMoment') &&
          !moment.quoteType
            ? true
            : null;
        optionStatus.visitHistory = permission(
          Operations.visitZoneMomentHistory,
        );
      } else {
        // 违规记录
        optionStatus.violation = permission('violationRecord') ? true : null;
        // 电文可见状态设置
        optionStatus.visibleMoment = !moment.parents.length;
        optionStatus.editorMoment = !moment.parents.length && !moment.quoteType;
        optionStatus.visitHistory = permission(
          Operations.visitOtherUserZoneMomentHistory,
        );
      }
    }
    if (permission(Operations.getMomentIpInfo)) {
      optionStatus.ipInfo = true;
    }
  }
  const stableDocument = await db.DocumentModel.getStableDocumentBySource(
    optionStatus.type,
    mid,
  );
  data.stableDocument = {
    _id: stableDocument._id,
    type: stableDocument.type,
    source: stableDocument.source,
    sid: stableDocument.sid,
  };
  data.optionStatus = optionStatus;
  data.toc = moment.toc;
  await next();
});
module.exports = router;
