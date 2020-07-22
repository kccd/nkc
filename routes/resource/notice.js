const Router = require('koa-router');
const { resolve, reject } = require('bluebird');
const noticeRouter = new Router();

let store = new Map();

noticeRouter
  .get('/', async (ctx, next) => {
    ctx.respond = false;
    let {res, query} = ctx;
    let {uid} = query;
    global.NKC.io.of('/common').send(uid);
    await next();
  });

module.exports = noticeRouter;

// 创建文件处理任务
noticeRouter.createProcessTask = function(uid) {
  let taskId = Date.now() + "_" + uid;
  if(store.has(uid)) {
    let desc = store.get(uid);
    desc.tasks.push(taskId);
  }else {
    store.set(uid, {
      tasks: [taskId]
    });
  }
  // console.log("创建了任务", store);
  return taskId;
}

// 发送处理完成事件给用户
noticeRouter.sendCompleteToUser = function(uid, taskId) {
  if(!store.has(uid)) return;
  let desc = store.get(uid);
  let {complete, tasks} = desc;
  if(!complete) return;
  let index = tasks.indexOf(taskId);
  if(index >= 0) {
    tasks.splice(index, 1);
    if(!tasks.length) {
      store.delete(uid);
    }
    // console.log("任务完成了", store);
    complete(taskId);
  }
}