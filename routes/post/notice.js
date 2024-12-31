const {
  sensitiveDetectionService,
} = require('../../services/sensitive/sensitiveDetection.service');
const { checkString } = require('../../nkcModules/checkData');
const router = require('koa-router')();
const {
  OnlyUnbannedUser,
  OnlyOperation,
} = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router
  .put('/:nid/content', OnlyUnbannedUser(), async (ctx, next) => {
    const { db, body, params, state, data } = ctx;
    const { nid, pid } = params;
    const { noticeContent: newNoticeContent } = body;
    const { toc, cv, noticeContent, status } =
      await db.NewNoticesModel.findOnly(
        { nid, pid },
        { toc: 1, cv: 1, noticeContent: 1, status: 1 },
      );
    const noticeStatus = await db.NewNoticesModel.noticeStatus();
    const post = await db.PostModel.findOnly({ pid }, { uid: 1 });
    const author = post.uid;

    //判断用户是否有权限修改
    if (author !== state.uid && !ctx.permission(Operations.disablePostNotice)) {
      ctx.throw(403, '权限不足');
    }
    if (status === noticeStatus.shield) {
      ctx.throw(403, '内容已被屏蔽，不允许修改');
    } else if (status === noticeStatus.history) {
      ctx.throw(403, '不允许修改历史版本的公告内容');
    } else if (newNoticeContent === noticeContent) {
      // 未更改任何内容
      return await next();
    }
    //检测文章通告内容是否有敏感词
    await sensitiveDetectionService.threadNoticeDetection(newNoticeContent);
    //检测文章通告内容是否超过字数限制
    checkString(newNoticeContent, { minTextLength: 5, maxTextLength: 200 });
    //更新公告内容
    //将原来的版本修改为历史版本
    await db.NewNoticesModel.updateOne(
      { nid },
      {
        $set: {
          status: noticeStatus.history,
        },
      },
    );

    //并创建一个新的通告，toc时间不改变
    data.newNotice = await db.NewNoticesModel.extendNoticeContent({
      pid,
      uid: state.uid,
      noticeContent: newNoticeContent,
      toc,
      cv,
    });
    await next();
  })
  .put(
    '/:nid/disabled',
    OnlyOperation(Operations.disablePostNotice),
    async (ctx, next) => {
      const { db, params, body } = ctx;
      const { nid, pid } = params;
      const { isShield, reason } = body;
      const { status } = await db.NewNoticesModel.findOnly(
        { nid, pid },
        { status: 1 },
      );
      const noticeStatus = await db.NewNoticesModel.noticeStatus();

      //判断用户是否有权限屏蔽
      if (!ctx.permission(Operations.disablePostNotice)) {
        ctx.throw(403, '权限不足');
      }

      if (status === noticeStatus.history) {
        ctx.throw(400, '无法操作历史版本');
      }
      if (isShield && status === noticeStatus.shield) {
        ctx.throw(400, '内容已经被屏蔽了，请刷新页面');
      }
      if (!isShield && status !== noticeStatus.shield) {
        ctx.throw(400, '内容未被屏蔽，请刷新页面');
      }

      await db.NewNoticesModel.updateOne(
        { nid, pid },
        {
          $set: {
            status: isShield ? noticeStatus.shield : noticeStatus.normal,
            reason: reason || '',
          },
        },
      );
      await next();
    },
  );
module.exports = router;
