const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {data, db, body} = ctx;
    const {user} = data;
    const {postsId, reason, remindUser, violation} = body;
    const results = [];
    const threads = [], threadsId = [];
    const recycleId = await db.SettingModel.getRecycleId();
    // 验证用户权限、验证内容是否存在
    for(const postId of postsId) {
      const post = await db.PostModel.findOne({pid: postId});
      if(!post) ctx.throw(400, `未找到ID为${postId}的post`);
      const thread = await db.ThreadModel.findOne({tid: post.tid});
      if(!thread) ctx.throw(400, `未找到ID为${post.tid}的thread`);
      let type = thread.oc === postId? "thread": "post";
      const isModerator = ctx.permission("superModerator") || await thread.isModerator(user, "or");
      if(!isModerator) ctx.throw(403, `您没有权限处理ID为${postId}的post`);
      if(type === "thread") {
        if(thread.type === "fund") ctx.throw(403, "基金类文章无法退修");
        if(thread.mainForumsId.includes(recycleId)) ctx.throw(400, `无法退回已在回收站的文章，tid: ${thread.tid}`);
        if(thread.recycleMark === true) ctx.throw(400, `ID为${thread.tid}的文章已被退修了`);
      }
      if(type === "post" && post.disabled) {
        ctx.throw(400, `ID为${post.pid}的回复已经被屏蔽了，请刷新`);
      }
      results.push({
        type,
        post,
        thread
      });
    }

    for(const r of results) {
      const {type, thread, post} = r;
      if(type === "thread") {
        data.targetUser = await thread.extendUser();
        data.thread = thread;
        data.post = post;
        await thread.update({recycleMark: true});
        const delLog = db.DelPostLogModel({
          delUserId: thread.uid,
          userId: user.uid,
          delType: "toDraft",
          delPostTitle: post.t,
          reason,
          postType: "thread",
          threadId: thread.tid,
          postId: thread.oc,
          noticeType: remindUser
        });
        await delLog.save();
        if(violation) {
          await db.UsersScoreLogModel.insertLog({
            user: data.targetUser,
            type: 'score',
            typeIdOfScoreChange: 'violation',
            port: ctx.port,
            ip: ctx.address,
            key: 'violationCount',
            description: reason || '退回文章并标记为违规'
          });
          await db.KcbsRecordModel.insertSystemRecord('violation', data.targetUser, ctx);
        }
        if(remindUser) {
          const mId = await db.SettingModel.operateSystemID('messages', 1);
          const message = db.MessageModel({
            _id: mId,
            ty: 'STU',
            r: thread.uid,
            c: {
              type: 'threadWasReturned',
              tid: thread.tid,
              rea: reason
            }
          });
          await message.save();
          await ctx.redis.pubMessage(message);
        }
        if(!thread.reviewed) await db.ReviewModel.newReview("returnThread", post, user, reason);
      } else {
        // 退修回复
        if(post.disabled) continue;
        const targetUser = await db.UserModel.findOnly({uid: post.uid});
        if(!threadsId.includes(thread.tid)) {
          threads.push(thread);
          threadsId.push(thread.tid);
        }
        await post.update({toDraft: true, disabled: true});
        if(!post.reviewed) await db.ReviewModel.newReview("returnPost", post, data.user, reason);
        const firstPost = await db.PostModel.findOnly({pid: thread.oc});
        const delLog = db.DelPostLogModel({
          delUserId: post.uid,
          userId: user.uid,
          delPostTitle: firstPost?firstPost.t: "",
          reason,
          postType: "post",
          threadId: thread.tid,
          postId: post.pid,
          delType: "toDraft",
          noticeType: remindUser
        });
        await delLog.save();
        if(remindUser) {
          const mId = await db.SettingModel.operateSystemID("messages", 1);
          const message = db.MessageModel({
            _id: mId,
            r: post.uid,
            ty: "STU",
            c: {
              type: "postWasReturned",
              pid: post.pid,
              rea: reason
            }
          });
          await message.save();
          await ctx.redis.pubMessage(message);
        }
        if(violation) {
          await db.UsersScoreLogModel.insertLog({
            user: targetUser,
            type: 'score',
            typeIdOfScoreChange: 'violation',
            port: ctx.port,
            ip: ctx.address,
            key: 'violationCount',
            description: reason || '退回回复并标记为违规'
          });
          await db.KcbsRecordModel.insertSystemRecord('violation', targetUser, ctx);
        }
      }
    }
    // 退修回复后，需要更新文章
    if(threads.length) {
      for(const thread of threads) {
        await thread.updateThreadMessage(false);
      }
    }
    await next();
  });
module.exports = router;
