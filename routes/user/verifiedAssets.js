const Router = require('koa-router');
const router = new Router();
const VerifiedUploadModel = require('../../dataModels/VerifiedUploadModel');
const { OnlyUser } = require('../../middlewares/permission');
router
  // 认证者查看自己上传的认证材料(只有上传者本人有权限查看)
  .get('/:vid', OnlyUser(), async (ctx, next) => {
    const { params, data, db } = ctx;
    const { vid } = params;
    const { user } = data;
    const asset = await VerifiedUploadModel.findOne({ _id: vid });
    if (!asset) {
      return ctx.throw(404, '未找到附件');
    }
    if (asset.uid !== user.uid) {
      return ctx.throw(403, '你不是附件的上传者，所以无权查看此附件');
    }
    const userPersonal = await db.UsersPersonalModel.findOnly({
      uid: user.uid,
    });
    const authenticate = userPersonal.authenticate;

    if (authenticate.card.attachments.includes(vid)) {
      // 身份认证2的图片
      if (authenticate.card.status !== 'in_review') {
        return ctx.throw(403, '非审核阶段不能查看认证材料');
      }
    } else if (authenticate.video.attachments.includes(vid)) {
      // 身份认证3的视频
      if (authenticate.video.status !== 'in_review') {
        return ctx.throw(403, '非审核阶段不能查看认证材料');
      }
    } else {
      return ctx.throw(403, '权限不足');
    }

    ctx.remoteFile = await asset.getRemoteFile();
    ctx.type = asset.ext;
    return next();
  });
module.exports = router;
