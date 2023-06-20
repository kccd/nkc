const Router = require('koa-router');
const router = new Router();
const { ThrowCommonError } = require('../../nkcModules/error');
const {
  sensitiveDetectionService,
} = require('../../services/sensitive/sensitiveDetection.service');
router.put('/', async (ctx, next) => {
  const { db, body, params, state } = ctx;
  const { nid } = params;
  const { noticeContent } = body;
  const { uid } = state;

  const { pid } = await db.NewNoticesModel.findOnly({ nid }, { pid: 1 });
  const threadPost = await db.PostModel.findOnly({ pid });
  const isModerator = await db.PostModel.isModerator(uid, pid);
  let threadHistory = null;
  //判断用户是否有权限修改
  if (
    threadPost.tlm > threadPost.toc &&
    ctx.permission('visitPostHistory') &&
    isModerator
  ) {
    threadHistory =
      !threadPost.hideHistories || ctx.permission('displayPostHideHistories')
        ? true
        : null;
  }
  if (threadHistory === null) {
    ThrowCommonError(403, '您没有相应的权限，或等级不足');
  }
  //检测文章通告内容是否有敏感词
  await sensitiveDetectionService.threadNoticeDetection(noticeContent);
  //更新公告内容
  await db.NewNoticesModel.updateOne(
    { nid },
    {
      $set: {
        noticeContent,
        uid,
      },
    },
  );
  await next();
});
module.exports = router;
