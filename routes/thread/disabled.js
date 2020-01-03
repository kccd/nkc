/*
* 移动文章到回收站
* */
const Router = require("koa-router");
const router = new Router();
router
  .post("/", async (ctx, next) => {
    const {data, db} = ctx;
    const {user} = data;
    const {tid} = ctx.params;
    const {para} = ctx.body;
    const targetThread = await db.ThreadModel.findOnly({tid});
    data.targetUser = await targetThread.extendUser();
    if(targetThread.mainForumsId.includes("recycle")) {
      ctx.throw(400, "文章已被移动到回收站了，请刷新");
    }
    const isModerator = ctx.permission("superModerator") || await targetThread.isModerator(user, "or");
    if(!isModerator) ctx.throw(403, "权限不足");
    const forums = await targetThread.extendForums(["mainForums"]);
    const recycle = await db.ForumModel.findOnly({fid: 'recycle'});
    forums.push(recycle);
    await targetThread.update({
      mainForumsId: ["recycle"],
      categoriesId: [],
      disabled: true,
      reviewed: true
    });
    await db.PostModel.updateOne({pid: targetThread.oc}, {
      $set: {
        reviewed: true
      }
    });
    await Promise.all(forums.map(async forum => {
      console.log(333);
      await forum.updateForumMessage();
    }));
    await targetThread.updateThreadMessage();

    await db.KcbsRecordModel.insertSystemRecord('threadBlocked', data.targetUser, ctx);
    if(para && para.illegalType) {
      await db.UsersScoreLogModel.insertLog({
        user: data.targetUser,
        type: 'score',
        typeIdOfScoreChange: 'violation',
        port: ctx.port,
        ip: ctx.address,
        key: 'violationCount',
        tid: targetThread.tid,
        description: para.reason || '屏蔽文章并标记为违规'
      });
      await db.KcbsRecordModel.insertSystemRecord('violation', data.targetUser, ctx);
    }

    // 添加删帖日志
    const post = await db.PostModel.findOne({pid: targetThread.oc});
    if(para){
      const posts = await db.PostModel.find({tid: targetThread.tid}, {uid: 1});
      const uidArr = new Set();
      for(const p of posts) {
        uidArr.add(p.uid);
      }
      para.postedUsers = [...uidArr];
      para.delUserId = targetThread.uid;
      para.userId = user.uid;
      para.delPostTitle = post.t;
      const delLog = new db.DelPostLogModel(para);
      await delLog.save();
    }
    if(para && para.noticeType) {
      const mId = await db.SettingModel.operateSystemID('messages', 1);
      const message = db.MessageModel({
        _id: mId,
        ty: 'STU',
        r: targetThread.uid,
        c: {
          type: 'bannedThread',
          tid: targetThread.tid,
          rea: para?para.reason:''
        }
      });
      await message.save();
      await ctx.redis.pubMessage(message);
    }
    if(!targetThread.reviewed) await db.ReviewModel.newReview("disabledThread", post, user, para.reason);
    await next();
  });
module.exports = router;