module.exports = {
  get: async (ctx, next) => {
    const {state, data, query, db, nkcModules} = ctx;
    const {user} = data;
    const {t, page} = query;
    if(!t) {
      ctx.template = "account/subscribe/subscribe.pug";
      return await next();
    }
    let q = {
      uid: user.uid
    };
    // 默认分类
    if(["all", "thread", "topic", "discipline", "user", "column"].includes(t)) {
      if(t !== "all") {
        if(["topic", "discipline"].includes(t)) {
          q.type = "forum";
          const forums = await db.ForumModel.find({forumType: t}, {fid: 1});
          q.fid = {$in: forums.map(f => f.fid)};
        } else {
          q.type = t;
        }
      }
    } else { // 自定义分类
      const type = await db.SubscribeTypeModel.findOne({_id: t});
      if(!type) ctx.throw(400, `未找到ID为${t}的关注分类`);
      q.cid = t;
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
  }
};