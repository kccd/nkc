const Router = require('koa-router');
const operationRouter = new Router();
operationRouter
  // 收藏文章
  .post("/collection", async (ctx, next) => {
    const {body, params, db, data} = ctx;
    const {tid} = params;
    const {type, cid = []} = body;
    const {user} = data;
    const thread = await db.ThreadModel.findOnly({tid});
    if(thread.disabled) ctx.throw(403, '不能收藏已被封禁的文章');
    await thread.extendForums(['mainForums', 'minorForums']);
    await thread.ensurePermission(data.userRoles, data.userGrade, data.user);
    let collection = await db.SubscribeModel.findOne({tid: tid, uid: user.uid, type: "collection"});
    if(type) {
      if(collection) ctx.throw(400, "文章已收藏，请勿重复提交");
      for(const typeId of cid) {
        const subType = await db.SubscribeTypeModel.findOne({_id: typeId, uid: user.uid});
        if(!subType) ctx.throw(400, `未找到ID为${typeId}的关注分类`);
      }
      collection = db.SubscribeModel({
        _id: await db.SettingModel.operateSystemID("subscribes", 1),
        uid: user.uid,
        tid,
        cid,
        type: "collection"
      });
      await collection.save();
      await db.SubscribeTypeModel.updateCount(cid);
    } else {
      if(!collection) ctx.throw(400, "文章未在收藏夹中，请刷新");
      const {cid} = collection;
      await collection.remove();
      await db.SubscribeTypeModel.updateCount(cid);
    }
    await db.SubscribeModel.saveUserCollectionThreadsId(user.uid);
    data.targetUser = await thread.extendUser();
    await next();
  })
  // 修改退修原因
  .put("/moveDraft/reason", async (ctx, next) => {
    const {body, db} = ctx;
    const {log} = body;
    if(!log.reason) ctx.throw(400, "退修原因不能为空");
    await db.DelPostLogModel.updateOne({
      _id: log._id
    }, {
      $set: {
        reason: log.reason
      }
    });

    let mType, obj = {
      ty: "STU"
    };
    if(log.postType === "thread") {
      mType = "threadWasReturned";
      obj[`c.tid`] = log.threadId;
    } else {
      mType = "postWasReturned";
      obj[`c.pid`] = log.postId;
    }
    obj[`c.type`] = mType;

    await db.MessageModel.updateOne(obj, {
      $set: {
        "c.rea": log.reason
      }
    });
    await next();
  });
module.exports = operationRouter;
