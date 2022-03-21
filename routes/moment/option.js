const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {db, data, params, query, state, permission} = ctx;
    const {mid} = params;
    const {user} = data;
    const {uid} = state;
    const {normal} = await db.MomentModel.getMomentStatus();
    const moment = await db.MomentModel.findOnly({_id: mid});
    if(!moment) ctx.throw(400, '未找到动态，请刷新');
    let isAuthor = await moment.getAuthorByUid(user.uid);
    //判断当动态的状态不正常时用户是否具有操作权限
    if(moment.status !== normal) {
      if(!permission('review') || !isAuthor) ctx.throw(400, '权限不足');
    }
    const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
    const {normal: normalStatus, deleted: deletedStatus} = await db.DocumentModel.getDocumentStatus();
    const {moment: momentSource} = await db.DocumentModel.getDocumentSources();
    const document = await db.DocumentModel.findOnly({did: moment.did, type: stableType, source: momentSource});
    if(!document) return ctx.throw(404, '未找到文章，请刷新后重试');
    if(!permission('review')) {
      if(document.status !== normalStatus || !isAuthor) ctx.throw(401, '权限不足');
    }
    const optionStatus = {
      type: 'moment',
      anonymous: null,
      complaint: null,
      reviewed: null,
      violation: null,
      blacklist: null,
      source: document.source
    };
    if(user) {
      //审核权限
      if(permission('review')) {
        optionStatus.reviewed = document.status;
        if(moment.status !== deletedStatus) optionStatus.delete = true;
      }
      if(isAuthor && moment.status !== deletedStatus) {
        optionStatus.delete = true;
      }
      //投诉权限
      optionStatus.complaint = permission('complaintPost')?true:null;
      // 未匿名
      if(!document.anonymous) {
        if(!isAuthor) {
          // 黑名单
          optionStatus.blacklist = await db.BlacklistModel.checkUser(user.uid, article.uid);
        }
        // 违规记录
        optionStatus.violation = ctx.permission('violationRecord')? true: null;
      }
    }
    data.optionStatus = optionStatus;
    data.toc = document.toc;
    await next();
  })
module.exports = router;
