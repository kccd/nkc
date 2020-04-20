// 这里只记录特定的记录，并不包含日志
// 需要记录日志的地方执行nkcSources/logger.js即可
module.exports = async (ctx, next) => {
  const {db, state, data} = ctx;
  const operationId = state.operation._id;
  const typeId = state.operation.typeId;
  await next();
  if(!data.user) return;
  const behavior = {
    type: operationId,
    operationId,
    error: ctx.error || "",
    ip: ctx.address,
    port: ctx.port,
    uid: data.user? data.user.uid: "",
    method: ctx.method,
    para: ctx._body,
    status: ctx.status,
    reqTime: ctx.reqTime || Date.now(),
    toc: ctx.reqTime || Date.now(),
    fid: data.forum? data.forum.fid: "",
    tid: data.thread? data.thread.tid: "",
    pid: data.post? data.post.pid: "",
    cid:  data.thread? data.thread.cid: "",
    toUid: data.targetUser? data.targetUser.uid: ""
  };
  // 根据操作名判断是否需要存入相应记录
  let operationTypes = await db.OperationTypeModel.find({_id: {$in: typeId}}, {type: 1});

  operationTypes = operationTypes.map(o => o.type);

  if(operationTypes.includes("experimental")) {
    await db.ManageBehaviorModel(behavior).save();
  }
  if(operationTypes.includes("userBehavior")) {
    await db.UsersBehaviorModel(behavior).save();
  }
  if(operationTypes.includes("timeLine")) {
    await db.InfoBehaviorModel(behavior).save();
  }
};
