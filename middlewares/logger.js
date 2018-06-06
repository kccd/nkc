
const nkcModules = require('../nkcModules');

const logger = async (ctx, next) => {
  const { db, address: ip, port } = ctx;
  const processTime = ctx.processTime;
  const {apiFunction} = nkcModules;
  const { getOperationId } = nkcModules.permission;
  ctx.data.operationId = getOperationId(ctx.url, ctx.method);
  // 获取用户的个人基本信息
  if(ctx.data.userLevel > 0){
    let userPersonal = await db.UsersPersonalModel.findOnly({uid: ctx.data.user.uid});
  }

  // -----------------------------------------------------------------------------------------  
  // 获取更改密码用到的数据
  if(ctx.body.password && ctx.data.operationId === "modifyPassword"){
    let newPassword = apiFunction.newPasswordObject(ctx.body.password); // 用户新密码及hash
  }
  let userIp = ctx.ip ? ctx.ip : ''; // 用户ip 没有则为空
  let requestMethod = ctx.method; // 请求方法
  let userPort = ctx.port ? ctx.port : ''; // 用户使用的端口 没有则为空
  let requestPara = requestMethod === "GET" || requestMethod === "DELETE" ? ctx.query : ctx.body; // 请求参数 GET||DELETE=>ctx.query  POST||PATCH=>ctx.body
  let requestStatus = ctx.status ? ctx.status : '500'; // 请求状态， 没有则500
  let requestTime = ctx.reqTime ? ctx.reqTime : Date.now; // 请求时间， 没有则使用当前时间
  let timeStamp = new Date().getTime(); // 时间戳

  await next();
  

  // 获取绑定邮箱的数据
  if(ctx.data.operation && ctx.data.operation === "bindEMail" && ctx.query.email){
    let newBindMail = ctx.query.email; // 新的邮件地址
  }
  // 获取更换邮箱的数据
  if(ctx.data.operation && ctx.data.operation === "verifyNewEmail" && ctx.query.email){
    let newChangeEmail = ctx.query.email; // 新的邮件地址
  }
  // console.log("hhh",ctx.query, ctx.data.operation, ctx.data.operationId)
  let operationId = ctx.data.operationId ? ctx.data.operationId : ''; // 操作id 如果没有则为空
  let userId = ctx.data.user ? ctx.data.user.uid : 'visitor'; // 用户身份 id或者游客
  let userLevel = ctx.data.userLevel ? ctx.data.userLevel : 0; //用户等级 没有则为0
  let targetUserId = ctx.data.targetUser ? ctx.data.targetUser.uid : ''; // 目标用户id 没有则为空
  let forumId = ctx.data.forum ? ctx.data.forum.fid : ''; // 板块id 没有则为空
  let categoryId = ctx.data.thread ? ctx.data.thread.cid : ''; // 分类id 没有则为空
  let threadId = ctx.data.thread ? ctx.data.thread.tid : ''; // 文章id 没有则为空
  let postId = ctx.data.post ? ctx.data.post.pid : ''; // 回复id 没有则为空
  let errorInfo = ctx.error ? ctx.error : ''; // 错误信息 没有则为空
  let classType = ctx.data.operation ? ctx.data.operation : ctx.data.operationId; // 操作类型，如果operation不存在时，则使用operationId

  // -----------------------------------------------------------------------------------------

  // -------------------------------------构建数据---------------------------------------------
  // 定义存入logs的数据
  let log = {
    operationId: ctx.data.operationId,
    error: ctx.error,
    method: ctx.method,
    path: ctx.path,
    query: ctx.query,
    status: ctx.status,
    ip,
    port,
    processTime,
    reqTime: ctx.reqTime,
    uid: ctx.data.user ? ctx.data.user.uid : 'visitor'
  };
  // 定义存入四分类的数据
  // console.log(ctx)
  let behavior = {
    type: classType,
    operationId: operationId,
    error: ctx.error,
    method: requestMethod,
    para: requestPara,
    status: requestStatus,
    ip: userIp,
    port: userPort,
    reqTime: requestTime,
    uid: userId,
    fid: forumId,
    cid: categoryId,
    tid: threadId,
    pid: postId
  };
  // ---------------------------------------构建数据结束----------------------------------------

  // -----------------------------------------存入大分类------------------------------------------
  // 根据operationId取出所在分类
  // 2 管理类 ManageBehaviorModel
  // 3 用户行为类 UsersBehaviorModel
  // 4 信息查询类 InfoBehaviorModel
  // 5 敏感信息类 SerectBehaviorModel
  let operationClassify = new Array();
  let topClassifySingle = await db.OperationModel.find({ "_id": ctx.data.operationId })
  if (topClassifySingle.length > 0) {
    operationClassify = topClassifySingle[0].typeId
  }

  // 根据分类调用不同的model
  for (let typeId of operationClassify) {
    // console.log(typeId)
    if (typeId === 2) {
      await new db.ManageBehaviorModel(behavior).save()
    }
    if (typeId === 3) {
      await new db.UsersBehaviorModel(behavior).save()
    }
    if (typeId === 4) {
      await new db.InfoBehaviorModel(behavior).save()
    }
    if (typeId === 5) {
      // const behavior = Object.assign(para, {port, ip});
      await new db.SecretBehaviorModel(behavior).save()
    }
  }
  // ---------------------------------------存入大分类结束-----------------------------------------

  // -----------------------------------------存入logs--------------------------------------------
  // 取出日志白名单，并在logs中记录日志
  let needLog = false;
  if (ctx.data.logSetting && ctx.data.logSetting.indexOf(ctx.data.operationId) > -1) {
    needLog = true;
  }
  if (ctx.status !== 304 && needLog) {
    await new db.LogModel(log).save();
  }
  // --------------------------------------存入logs结束-------------------------------------------
  // await next()
};
module.exports = logger;
// module.exports = async (ctx) => {
//   const {LogModel} = ctx.db;
//   const processTime = ctx.processTime;
//   const {address: ip, port} = ctx;
//   const log = {
//     error: ctx.error,
//     method: ctx.method,
//     path: ctx.path,
//     query: ctx.query,
//     status: ctx.status,
//     ip,
//     port,
//     reqTime: ctx.reqTime,
//     processTime,
//     uid: ctx.data.user? ctx.data.user.uid : 'visitor'
//   };
//   if(ctx.logIt) {
//     if (ctx.error) {
//       console.error(
//         ' Error '.bgRed + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${(ctx.data.operation || '404').bgGreen} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).red}`
//       );
//       if (global.NKC.NODE_ENV !== 'production')
//         console.error(log.error);
//     } else {
//       console.log(
//         ' Info '.bgGreen + ` ${log.reqTime.toLocaleTimeString().grey} ${log.uid.bgCyan} ${log.method.black.bgYellow} ${(ctx.data.operation || '404').bgGreen} ${log.path.bgBlue} <${processTime.green}ms> ${String(log.status).green}`
//       );
//     }
//   }
//   const pathArr = log.path.split('/');
// 	const lastPath = pathArr[pathArr.length - 1];
// 	let needLog = true;
// 	for(let path of excludePath) {
// 		if(lastPath.includes(path)) {
// 			needLog = false;
// 		}
// 	}
// 	if(pathArr[1] && ['favicon.ico', 'avatar','avatar_small' , 'cover', 'pfa', 'pfb', 'photo', 'photo_small'].includes(pathArr[1])) {
// 		needLog = false;
// 	}
//   if(ctx.status !== 304 && needLog) {
// 	  await new LogModel(log).save();
//   }
// };