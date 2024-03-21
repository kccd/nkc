const { collectionService } = require("../../services/subscribe/collection.service");

module.exports = async (ctx, next) => {
  const {db, data, state, params, query, permission, permissionsOr} = ctx;
  const {_id} = params;
  const {aid} = query;
  const {user} = data;
  const {uid} = state;
  const {stable: stableType} = await db.DocumentModel.getDocumentTypes();
  const {comment: commentSource} = await db.DocumentModel.getDocumentSources();
  const comment = await db.CommentModel.findOnly({_id});
  const document = await db.DocumentModel.findOnly({did: comment.did, type: stableType});
  if(!comment || !document) return ctx.throw(400, '未找到评论，请刷新后重试');
  const isComment = document.source === commentSource;
  const optionStatus = {
    anonymous: null,
    anonymousUser: null,
    disabled: null,
    complaint: null,
    reviewed: null,
    editor: null,
    ipInfo: null,
    violation: null,
    blacklist: null,
    digest: null,
    xsf: null,
    collection: null,
  };
  if(user) {
    data.digestRewardScore = await db.SettingModel.getScoreByOperationType('digestRewardScore');
    data.redEnvelopeSettings = await db.SettingModel.getSettings('redEnvelope');
    if(isComment) {
      //审核权限
      if(permission('review')) {
        optionStatus.reviewed = document.status
      }
      //评论加精权限
      if(ctx.permission('digestPost')) {
        optionStatus.digest = comment.digest;
      }
      //用户具有自己的评论的编辑权限以及管理员编辑权限
      if(uid === comment.uid || permissionsOr(['pushThread', 'moveThreads', 'movePostsToDraft', 'movePostsToRecycle', 'digestThread', 'unDigestThread', 'toppedThread', 'unToppedThread', 'homeTop', 'unHomeTop'])) {
        optionStatus.editor = true;
      }
      // 评学术分
      if(ctx.permission('creditXsf')) {
        optionStatus.xsf = true;
      }
      //退修禁用权限
      optionStatus.disabled = (
        (ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft'))
      )? true: null;
      //投诉权限
      if(uid !== comment.uid) {
        optionStatus.complaint = permission('complaintPost')?true:null;
      }
      //查看IP
      optionStatus.ipInfo = ctx.permission('ipinfo')? document.ip : null;
      // 未匿名
      if(!document.anonymous) {
        if(user.uid !== comment.uid) {
          // 黑名单
          optionStatus.blacklist = await db.BlacklistModel.checkUser(user.uid, comment.uid);
        }
        // 违规记录
        optionStatus.violation = ctx.permission('violationRecord')? true: null;
        data.commentUserId = comment.uid;
      }
      //收藏回复
      optionStatus.collection = await collectionService.isCollectedComment(
        user.uid,
        comment._id,
      );
    }
  }
  data.options = optionStatus;
  data.toc = document.toc;
  await next();
};
