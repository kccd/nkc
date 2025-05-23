const Router = require('koa-router');
const router = new Router();
const { OnlyOperation } = require('../../middlewares/permission');
const { Operations } = require('../../settings/operations');
router.post(
  '/',
  OnlyOperation(Operations.movePostsToDraft),
  async (ctx, next) => {
    //退修post
    const { data, db, body } = ctx;
    const { user } = data;
    const { postsId, reason, remindUser, violation } = body;
    const results = [];
    const threads = [],
      threadsId = [];
    const recycleId = await db.SettingModel.getRecycleId();
    const source = await db.ReviewModel.getDocumentSources();
    // 验证用户权限、验证内容是否存在
    for (const postId of postsId) {
      const post = await db.PostModel.findOne({ pid: postId });
      if (!post) {
        ctx.throw(400, `未找到ID为${postId}的post`);
      }
      const thread = await db.ThreadModel.findOne({ tid: post.tid });
      if (!thread) {
        ctx.throw(400, `未找到ID为${post.tid}的thread`);
      }
      let type = thread.oc === postId ? 'thread' : 'post';
      const isModerator =
        ctx.permission('superModerator') ||
        (await thread.isModerator(user, 'or'));
      if (!isModerator) {
        ctx.throw(403, `您没有权限处理ID为${postId}的post`);
      }
      if (type === 'thread') {
        if (thread.type === 'fund') {
          ctx.throw(403, '基金类文章无法退修');
        }
        if (thread.mainForumsId.includes(recycleId)) {
          ctx.throw(400, `无法退回已在回收站的文章，tid: ${thread.tid}`);
        }
        if (thread.recycleMark === true) {
          ctx.throw(400, `ID为${thread.tid}的文章已被退修了`);
        }
      }
      if (type === 'post' && post.disabled) {
        ctx.throw(400, `ID为${post.pid}的回复已经被屏蔽了，请刷新`);
      }
      results.push({
        type,
        post,
        thread,
      });
    }

    for (const r of results) {
      const { type, thread, post } = r;
      let targetUser;
      if (type === 'thread') {
        // 退修文章
        targetUser = await thread.extendUser();
        data.targetUser = targetUser;
        data.thread = thread;
        data.post = post;
        await thread.updateOne({ recycleMark: true, reviewed: true });
        const delLog = db.DelPostLogModel({
          delUserId: thread.uid,
          userId: user.uid,
          delType: 'toDraft',
          delPostTitle: post.t,
          reason,
          postType: 'thread',
          threadId: thread.tid,
          postId: thread.oc,
          noticeType: remindUser,
        });
        await delLog.save();
        if (!thread.reviewed) {
          await db.ReviewModel.newReview({
            type: 'returnThread',
            sid: post.pid,
            uid: post.uid,
            reason,
            handlerId: user.uid,
            source: source.post,
          });
        }
      } else {
        // 退修回复
        if (post.disabled) {
          continue;
        }
        targetUser = await db.UserModel.findOnly({ uid: post.uid });
        if (!threadsId.includes(thread.tid)) {
          threads.push(thread);
          threadsId.push(thread.tid);
        }
        await post.updateOne({
          toDraft: true,
          disabled: false,
          reviewed: true,
        });
        if (!post.reviewed) {
          await db.ReviewModel.newReview({
            type: 'returnPost',
            sid: post.pid,
            uid: post.uid,
            reason,
            handlerId: data.user.uid,
            source: source.post,
          });
        }
        const firstPost = await db.PostModel.findOnly({ pid: thread.oc });
        const delLog = db.DelPostLogModel({
          delUserId: post.uid,
          userId: user.uid,
          delPostTitle: firstPost ? firstPost.t : '',
          reason,
          postType: 'post',
          threadId: thread.tid,
          postId: post.pid,
          delType: 'toDraft',
          noticeType: remindUser,
        });
        await delLog.save();
      }
      // 标记为违规
      if (violation) {
        await db.UsersScoreLogModel.insertLog({
          user: targetUser,
          type: 'score',
          typeIdOfScoreChange: 'violation',
          port: ctx.port,
          ip: ctx.address,
          key: 'violationCount',
          description:
            reason ||
            (type === 'thread'
              ? '退回文章并标记为违规'
              : '退回回复并标记为违规'),
        });
        await db.KcbsRecordModel.insertSystemRecord(
          'violation',
          targetUser,
          ctx,
        );
      }
      // 发送退修或回复通知给用户
      if (remindUser) {
        const mId = await db.SettingModel.operateSystemID('messages', 1);
        const messageObj = {
          _id: mId,
          r: post.uid,
          ty: 'STU',
          c: {
            rea: reason,
          },
        };
        if (type === 'thread') {
          messageObj.c.type = 'threadWasReturned';
          messageObj.c.tid = thread.tid;
        } else if (type === 'post') {
          messageObj.c.type = 'postWasReturned';
          messageObj.c.pid = post.pid;
        } else {
          ctx.throw(500, `post type error. pid: ${post.pid} type: ${type}`);
        }
        const message = db.MessageModel(messageObj);
        await message.save();
        await ctx.nkcModules.socket.sendMessageToUser(message._id);
      }
    }
    // 退修回复后，需要更新文章
    if (threads.length) {
      for (const thread of threads) {
        await thread.updateThreadMessage(false);
      }
    }
    await next();
  },
);
module.exports = router;
