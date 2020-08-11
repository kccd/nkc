// 这里只记录特定的记录，并不包含日志
// 需要记录日志的地方执行nkcSources/logger.js即可
const {usersBehavior, experimental, timeLine} = require('../settings/operationsType');
module.exports = async (ctx, next) => {
  const {db, state, data} = ctx;
  const operationId = state.operation._id;
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

  if(usersBehavior.includes(operationId)) {
    await db.UsersBehaviorModel(behavior).save();
  } else if(experimental.includes(operationId)) {
    await db.ManageBehaviorModel(behavior).save();
  } else if(timeLine.includes(operationId)) {
    await db.InfoBehaviorModel(behavior).save();
  }
};
