const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {state, data, db, params} = ctx;
    const {user} = data;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    const isThread = post.type === 'thread';
    const isPost = post.type === 'post';
    data.postType = isThread? 'thread': 'post';
    data.tid = thread.tid;
    data.pid = pid;
    const optionStatus = {
      anonymous: null,
      anonymousUser: null,
      topped: null,
      digest: null,
      blacklist: null,
      collection: null,
      inColumn: null,
      subscribe: null,
      hidePost: null,
      xsf: null,
      warningPost: null,
      edit: null,
      disable: null,
      history: null,
      violation: null,
      complaint: null,
    };
    if(user) {
      // 推送到专栏
      if(state.userColumn && isThread) {
        data.userColumnId = state.userColumn._id;
        optionStatus.inColumn = await db.ColumnPostModel.checkColumnPost(state.userColumn._id, pid);
      }
      if(isThread) {
        // 收藏
        optionStatus.collection = await db.SubscribeModel.checkCollectionThread(user.uid, post.tid);
        // 关注
        optionStatus.subscribe = await db.SubscribeModel.checkSubscribeThread(user.uid, post.tid);
      }
      if(isPost) {
        // 回复置顶
        if(
          (ctx.permission("topAllPost") ||
            (user.uid === thread.uid && await db.PostModel.ensureToppingPermission(user.uid)))
        ) {
          optionStatus.topped = thread.toppedPostsId.includes(post.pid);
        }
        // 折叠回复
        if(await db.PostModel.ensureHidePostPermission(thread, user)) {
          optionStatus.hidePost = post.hide;
        }
      }
      // 未匿名
      if(!post.anonymous) {
        // 黑名单
        optionStatus.blacklist = await db.BlacklistModel.checkUser(user.uid, post.uid);
        // 违规记录
        optionStatus.violation = ctx.permission('violationRecord')? true: null;
        data.postUserId = post.uid;
      }
      // 加精
      if(ctx.permission('digestPost')) {
        optionStatus.digest = post.digest;
      }
      // 匿名
      if(ctx.permission('anonymousPost')) {
        optionStatus.anonymous = post.anonymous;
        // 查看匿名用户
        if(post.anonymous && ctx.permission('getPostAuthor')) {
          optionStatus.anonymousUser = true;
        }
      }
      // 评学数分
      if(ctx.permission('creditXsf')) {
        optionStatus.xsf = true;
      }
      // 鼓励
      if(ctx.permission('creditKcb')) {
        optionStatus.kcb = true;
      }
      // 建议修改
      if(ctx.permission('postWarningPost')) {
        optionStatus.warningPost = true;
      }
      // 编辑
      if(
        // 回复或不是基金的文章
        (!isThread || thread.type !== 'fund') &&
        (post.uid === user.uid || ctx.permission('modifyOtherPosts'))
      ) {
        const modifyPostTimeLimit = await db.UserModel.getModifyPostTimeLimitMS(user.uid);
        if(modifyPostTimeLimit >= (Date.now() - new Date(post.toc).getTime())) {
          // 未超过修改的最大时间
          optionStatus.edit = true;
        }
      }
      // 退修&删除
      if(isPost) {
        optionStatus.disable = (
          ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft')
        )? true: null;
      }
      // 历史
      if(post.tlm > post.toc && ctx.permission('visitPostHistory')) {
        optionStatus.history = (
          !post.hideHistories || ctx.permission('displayPostHideHistories')
        )? true: null;
      }
      // 投诉
      optionStatus.complaint = ctx.permission('complaintGet')? true: null;
      optionStatus.ipInfo = ctx.permission('ipinfo')? post.iplm || post.ipoc: null;
    }
    data.options = optionStatus;
    await next();
  });
module.exports = router;
