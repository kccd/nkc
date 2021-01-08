const router = require('koa-router')();
router
  .get('/', async (ctx, next) => {
    const {state, data, db, params} = ctx;
    const {user} = data;
    const {uid} = state;
    const {pid} = params;
    const post = await db.PostModel.findOnly({pid});
    const thread = await db.ThreadModel.findOnly({tid: post.tid});
    const isModerator = await db.PostModel.isModerator(uid, pid);
    const isThread = post.type === 'thread';
    const isPost = post.type === 'post';
    const isComment = !!post.parentPostId;
    data.postType = isThread? 'thread': 'post';
    data.isComment = isComment;
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
      kcb: null,
      warningPost: null,
      edit: null,
      disable: null,
      history: null,
      violation: null,
      complaint: null,
      reviewed: null,
      ipInfo: null,
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
          !isComment &&
          (ctx.permission("topAllPost") || // 特殊指定权限
            (user.uid === thread.uid && await db.PostModel.ensureToppingPermission(user.uid))) // 文章作者且具备置顶的条件
        ) {
          optionStatus.topped = thread.toppedPostsId.includes(post.pid);
        }
        // 折叠回复
        if(!isComment && await db.PostModel.ensureHidePostPermission(thread, user)) {
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
      if(ctx.permission('digestPost') && isModerator) {
        optionStatus.digest = post.digest;
      }
      // 审核
      if(ctx.permission('review') && isModerator) {
        optionStatus.reviewed = post.reviewed;
      }
      // 匿名
      if(ctx.permission('anonymousPost') && isModerator) {
        optionStatus.anonymous = post.anonymous;
        // 查看匿名用户
        if(post.anonymous && ctx.permission('getPostAuthor') && isModerator) {
          optionStatus.anonymousUser = true;
        }
      }
      // 评学术分
      if(ctx.permission('creditXsf') && isModerator) {
        optionStatus.xsf = true;
      }
      // 鼓励
      if(ctx.permission('creditKcb')) {
        optionStatus.kcb = true;
      }
      // 建议修改
      if(ctx.permission('postWarningPost') && isModerator) {
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
          (ctx.permission('movePostsToRecycle') || ctx.permission('movePostsToDraft')) && isModerator
        )? true: null;
      }
      // 历史
      if(post.tlm > post.toc && ctx.permission('visitPostHistory') && isModerator) {
        optionStatus.history = (
          !post.hideHistories || ctx.permission('displayPostHideHistories')
        )? true: null;
      }
      // 投诉
      optionStatus.complaint = ctx.permission('complaintGet')? true: null;
      optionStatus.ipInfo = ctx.permission('ipinfo')? post.iplm || post.ipoc: null;
    }
    data.options = optionStatus;
    data.toc = post.toc;
    await next();
  });
module.exports = router;
