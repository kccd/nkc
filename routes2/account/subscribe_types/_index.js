module.exports = {
  get: async (ctx, next) => {
    const {data, db, query} = ctx;
    const {user} = data;
    const {count} = query;
    if(count) {
      data.counts = {
        total: await db.SubscribeModel.count({uid: user.uid}),
        column: await db.SubscribeModel.count({uid: user.uid, type: "column"}),
        user: await db.SubscribeModel.count({uid: user.uid, type: "user"}),
        thread: await db.SubscribeModel.count({uid: user.uid, type: "thread"}),
      };
      const forums = await db.ForumModel.find({}, {fid: 1, forumType: 1});
      const topic = [];
      const discipline = [];
      forums.map(forum => {
        if(forum.forumType === "topic") {
          topic.push(forum.fid);
        } else {
          discipline.push(forum.fid);
        }
      });
      data.counts.topic = await db.SubscribeModel.count({uid: user.uid, type: "forum", fid: {$in: topic}});
      data.counts.discipline = await db.SubscribeModel.count({uid: user.uid, type: "forum", fid: {$in: discipline}});
    }
    data.types = await db.SubscribeTypeModel.getTypesList(user.uid);
    await next();
  },
  post: async (ctx, next) => {
    const {tools, data, db, body} = ctx;
    const {contentLength} = tools.checkString;
    const {user} = data;
    let {name, pid = null} = body;
    if(!name) ctx.throw(400, "分类名不能为空");
    if(contentLength(name) > 20) ctx.throw(400, "分类名不能超过20字符");
    if(pid) {
      const parentType = await db.SubscribeTypeModel.findOne({uid: user.uid, _id: pid});
      if(!parentType) ctx.throw(400, `未找到ID为${pid}的关注分类`);
    }
    const sameName = await db.SubscribeTypeModel.findOne({name, uid: user.uid});
    if(sameName) ctx.throw(400, "分类名已存在");
    const lastType = await db.SubscribeTypeModel.findOne({uid: user.uid}).sort({order: -1});
    const order = lastType? (lastType.order || 1) + 1: 1;
    const type = db.SubscribeTypeModel({
      _id: await db.SettingModel.operateSystemID("subscribeTypes", 1),
      uid: user.uid,
      name,
      order,
      pid
    });
    await type.save();
    data.type = type;
    await next();
  }
};