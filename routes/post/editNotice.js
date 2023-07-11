const Router = require('koa-router');
const router = new Router();
const { ThrowCommonError } = require('../../nkcModules/error');
const {
  sensitiveDetectionService,
} = require('../../services/sensitive/sensitiveDetection.service');
const { checkString } = require('../../nkcModules/checkData');
router.put('/', async (ctx, next) => {
  const { db, body, params, state, data } = ctx;
  const { nid } = params;
  const newNoticeContent = body.noticeContent;
  const { type } = body;
  const { pid, toc, cv, noticeContent, status } =
    await db.NewNoticesModel.findOnly(
      { nid },
      { pid: 1, toc: 1, cv: 1, noticeContent: 1, status: 1 },
    );
  const { history, shield } = await db.NewNoticesModel.noticeStatus();
  let author = '';
  if (type === 'thread') {
    const thread = await db.ThreadModel.findOnly({ oc: pid }, { uid: 1 });
    author = thread.uid;
  } else if (type === 'post') {
    const post = await db.PostModel.findOnly({ pid }, { uid: 1 });
    author = post.uid;
  }

  //判断用户是否有权限修改
  if (author !== state.uid && !ctx.permission('editNoticeContent')) {
    ThrowCommonError(403, '您没有相应的权限，或等级不足');
  } else if (status === shield) {
    ThrowCommonError(403, '该通告已经被屏蔽请刷新');
  } else if (status === history) {
    ThrowCommonError(403, '该通告已经成为历史版本请刷新');
  }
  //检测文章通告内容是否有更改
  else if (newNoticeContent === noticeContent) {
    ThrowCommonError(403, '您的通告内容没有任何更改');
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
        status: history,
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
});
module.exports = router;
