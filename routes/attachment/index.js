const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
const AUDIT_TYPES = {
  userAvatarAudit: 'avatar',
  userBannerAudit: 'banner',
  userHomeBannerAudit: 'homeBanner',
};
router.get('/:id', Public(), async (ctx, next) => {
  const { params, db, query, data, settings } = ctx;
  const { id } = params;
  const { t } = query;
  const { user } = data;
  if (t && !['sm', 'lg', 'md', 'ico'].includes(t))
    ctx.throw(400, '未知的文件尺寸');
  const attachment = await db.AttachmentModel.findOne({ _id: id });
  if (!attachment || attachment.disabled) {
    ctx.filePath = settings.statics.defaultAvatarPath;
    return await next();
  }

  // 判断是否属于“审核中头像/背景”类型
  const auditField = AUDIT_TYPES[attachment.type];
  if (auditField) {
    // 查出最新一条对应的审核记录
    const userAudit = await db.UserAuditModel.findOne({
      [auditField]: attachment._id,
    }).sort({ toc: -1 });
    if (!userAudit) {
      ctx.filePath = settings.statics.defaultAvatarPath;
      return await next();
    }
    const { approved } = db.UserAuditModel.getAuditStatus();
    if (userAudit.status !== approved) {
      // 只有本人或有权限才能看
      const isOwner = user && user.uid === userAudit.uid;
      const canReview = ctx.permission('review');
      if (!isOwner && !canReview) {
        ctx.filePath = settings.statics.defaultAvatarPath;
        return await next();
      }
    }
  }

  // 其余情况，返回真实文件
  ctx.remoteFile = await attachment.getRemoteFile(t);
  return await next();
});
module.exports = router;
