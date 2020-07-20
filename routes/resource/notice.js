const Router = require('koa-router');
const { resolve, reject } = require('bluebird');
const noticeRouter = new Router();

let store = new Map();

noticeRouter
  .get('/', async (ctx, next) => {
    ctx.respond = false;
    let {res, query} = ctx;
    let {uid} = query;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write("data: 文件处理完之后我会再发一条complete事件通知你\n\n");
    return new Promise((resolve, reject) => {
      res.socket.on("close", resolve);
      if(store.has(uid)) {
        let desc = store.get(uid);
        desc.complete = (taskId) => {
          res.write("event: complete\nid: "+ taskId +"\ndata: 处理完成\n\n");
          resolve();
        }
      } else {
        /**
         * @todo 可能存在内存泄露问题，待优化
         */
        store.set(uid, {
          tasks: [],
          complete: (taskId) => {
            res.write("event: complete\nid: "+ taskId +"\ndata: 处理完成\n\n");
            resolve();
          }
        });
      }

    }).finally(() => {
      res.end();
    })
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