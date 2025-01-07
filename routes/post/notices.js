const tools = require('../../nkcModules/tools');
const router = require('koa-router')();
const { Public } = require('../../middlewares/permission');
router.get('/', Public(), async (ctx, next) => {
  const { db, params, data, state } = ctx;
  const { pid } = params;
  const { uid } = state;
  const { normal, shield } = await db.NewNoticesModel.noticeStatus();
  const post = await db.PostModel.findOnly({ pid });
  //屏蔽通告权限
  let shieldNotice = ctx.permission('disablePostNotice');
  //编辑通告权限
  let canEditNotice = post.uid === uid || ctx.permission('disablePostNotice');
  const noticeObj = { pid, status: normal };
  if (shieldNotice || post.uid === uid) {
    noticeObj.status = { $in: [normal, shield] };
  }
  //查看回复历史权限
  let postHistory = null;
  const isModerator = await db.PostModel.isModerator(uid, pid);
  if (
    post.tlm > post.toc &&
    ctx.permission('visitPostHistory') &&
    isModerator
  ) {
    postHistory =
      !post.hideHistories || ctx.permission('displayPostHideHistories')
        ? true
        : null;
  }
  const notices = await db.NewNoticesModel.find(noticeObj)
    .sort({ toc: -1 })
    .lean();
  if (notices.length !== 0) {
    const userId = Array.from(new Set(notices.map((item) => item.uid)));
    //获取通告用户信息
    const users = await db.UserModel.find(
      { uid: { $in: userId } },
      { avatar: 1, uid: 1, username: 1 },
    ).lean();
    //获取历史版本
    const cv = Array.from(
      new Set(notices.map((item) => item.cv).filter(Boolean)),
    );
    //获取hid数组对象
    const hidArr = await db.HistoriesModel.find(
      { pid, cv: { $in: cv } },
      { _id: 1, cv: 1, pid: 1 },
    ).lean();
    //筛选出来的hid对象
    const uniqueArr = hidArr.filter((item, index, self) => {
      return index === self.findIndex((t) => t.cv === item.cv);
    });
    data.postNotices = notices.map((notice) => {
      const user = users.find((item) => item.uid === notice.uid);
      const hidObj = uniqueArr.find((item) => item.cv === notice.cv);
      const updatedUser = {
        ...user,
        avatar: tools.getUrl('userAvatar', user.avatar),
      };
      return {
        ...notice,
        hid: hidObj ? hidObj._id : null,
        user: updatedUser,
      };
    });
    data.permission = {
      canEditNotice,
      shieldNotice,
      postHistory,
    };
  } else {
    data.postNotices = [];
    data.permission = {
      canEditNotice,
      shieldNotice,
      postHistory,
    };
  }
  await next();
});
module.exports = router;
