module.exports = {
  get: async (ctx, next) => {
    const {state, data, query, db, nkcModules} = ctx;
    const {user} = data;
    const {t, page, c} = query;
    if(!t) {
      ctx.template = "account/subscribe/subscribe.pug";
      return await next();
    }
    let q = {
      uid: user.uid
    };
    if(t !== "all") {
      q.cid = t;
    }
    if(["all", "thread", "topic", "discipline", "user", "column"].includes(c)) {
      if(c !== "all") {
        if(["topic", "discipline"].includes(c)) {
          q.type = "forum";
          const forums = await db.ForumModel.find({forumType: c}, {fid: 1});
          q.fid = {$in: forums.map(f => f.fid)};
        } else {
          q.type = c;
        }
      }
    } else {
      ctx.throw(400, `未知的参数类型：c = ${c}`);
    }
    const count = await db.SubscribeModel.count(q);
    const paging = nkcModules.apiFunction.paging(page, count);
    const subscribes = await db.SubscribeModel.find(q).sort({toc: -1}).skip(paging.start).limit(paging.perpage);
    data.subscribes = await db.SubscribeModel.extendSubscribes(subscribes);
    data.subForumsId = state.subForumsId;
    data.subUsersId = state.subUsersId;
    data.subColumnsId = state.subColumnsId;
    data.subThreadsId = await db.SubscribeModel.getUserSubThreadsId(user.uid);
    data.paging = paging;
    await next();
  },
  patch: async (ctx, next) => {
    const {db, body} = ctx;
    const {type, subscribesId, typesId} = body;
    if(type === "modifyType") {
      let typesId_ = [];
      for(const typeId of typesId) {
        const type = await db.SubscribeTypeModel.findOne({_id: typeId});
        if(!type) ctx.throw(400, `未找到ID为${typeId}的分类`);
        typesId_.push(type._id);
      }
      for(const _id of subscribesId) {
        const sub = await db.SubscribeModel.findOne({_id});
        if(!sub) continue;
        typesId_ = typesId_.concat(sub.cid);
        await sub.update({
          cid: typesId
        });
      }
      await db.SubscribeTypeModel.updateCount([...(new Set(typesId_))]);
    }
    await next();
  }
};