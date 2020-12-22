const Router = require('koa-router');
const router  = new Router();

router
  // 审核专业页面
  .get("/" , async (ctx, next) => {
    const {data, db} = ctx;
    const pForums = await db.PreparationForumModel.find({}).sort({toc: 1, review: 1});
    const result = [];
    for(let forum of pForums) {
      let forumObject = forum.toObject();
      let { uid } = forumObject;
      let user = await db.UserModel.findOne({uid}, {username: true});
      forumObject.username = user.username || "未知用户";
      result.push(forumObject);
    }
    data.pForums = result;
    ctx.template = "/experimental/reviewForum/reviewForum.pug";
    await next();
  })
  .post("/resolve", async (ctx, next) => {
    const { body, db } = ctx;
    const { pfid } = body;
    await db.PreparationForumModel.update({pfid}, {
      $set: {
        review: "resolved"
      }
    });
    const pForum = await db.PreparationForumModel.findOne({pfid});
    // 在正式专业表中创建筹备专业
    const newForum = await db.ForumModel.createForum(pForum.info.newForumName, "pForum");
    // 把创始人名单添加到记录中
    await db.ForumModel.update({fid: newForum.fid}, {
      $set: {
        founders: pForum.founders
      }
    });
    // 把正式专业的fid更新到筹备专业表里、设置筹备截止时间
    await db.PreparationForumModel.update({pfid}, {
      $set: {
        fid: newForum.fid,
        expired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
    // 发送审核通过消息
    await db.MessageModel.sendNewForumReviewResolve({
      pfid,
      fid: newForum.fid,
      targetUid: pForum.uid
    });
    return next();
  })
  .post("/reject", async (ctx, next) => {
    const { body, db } = ctx;
    const { pfid } = body;
    await db.PreparationForumModel.update({pfid}, {
      $set: {
        review: "rejected"
      }
    });
    const pForum = await db.PreparationForumModel.findOne({pfid});
    await db.MessageModel.sendNewForumReviewReject({
      pfid,
      targetUid: pForum.uid
    });
    return next();
  });


module.exports = router;
