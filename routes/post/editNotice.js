const Router = require('koa-router');
const router = new Router();
const { ThrowCommonError } = require('../../nkcModules/error');
const {
  sensitiveDetectionService,
} = require('../../services/sensitive/sensitiveDetection.service');
const { checkString } = require('../../nkcModules/checkData');
router.put('/', async (ctx, next) => {
  const { db, body, params, state } = ctx;
  const { nid } = params;
  const { noticeContent } = body;
  const { pid, uid, toc, cv } = await db.NewNoticesModel.findOnly(
    { nid },
    { pid: 1, uid: 1, toc: 1, cv: 1 },
  );
  const thread = await db.ThreadModel.findOnly({ oc: pid }, { uid: 1 });
  //判断用户是否有权限修改
  if (thread.uid !== state.uid && !ctx.permission('editNoticeContent')) {
    ThrowCommonError(403, '您没有相应的权限，或等级不足');
  }
  //检测文章通告内容是否有敏感词
  await sensitiveDetectionService.threadNoticeDetection(noticeContent);
  //检测文章通告内容是否超过字数限制
  checkString(noticeContent, { minTextLength: 5, maxTextLength: 200 });
  //更新公告内容
  //将原来的版本修改为历史版本
  await db.NewNoticesModel.updateOne(
    { nid },
    {
      $set: {
        status: 'history',
      },
    },
  );
  //并创建一个新的通告，toc时间不改变
  await db.NewNoticesModel.extendNoticeContent({
    pid,
    uid,
    noticeContent,
    toc,
    cv,
  });
  await next();
});
module.exports = router;
