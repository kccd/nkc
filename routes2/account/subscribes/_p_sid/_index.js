module.exports = {
  use: async (ctx, next) => {
    const {db, data, params} = ctx;
    const {sid} = params;
    const {user} = data;
    const subscribe = await db.SubscribeModel.findOne({uid: user.uid, _id: sid});
    if(!subscribe) ctx.throw(400, `未找到ID为${sid}的关注记录`);
    data.subscribe = subscribe;
    await next();
  },
  patch: async (ctx, next) => {
    const {data, body, db} = ctx;
    const {subscribe, user} = data;
    let {typesId} = body;
    const {cid} = subscribe;
    const types = await db.SubscribeTypeModel.find({uid: user.uid, _id: {$in: typesId}});
    typesId = types.map(t => t._id);
    await subscribe.update({
      cid: typesId
    });
    typesId = new Set(typesId.concat(cid));
    await db.SubscribeTypeModel.updateCount([...typesId]);
    await next();
  }
};