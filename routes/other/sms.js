const Router = require('koa-router');
const smsRouter = new Router();
const nkcModules = require('../../nkcModules');
const settings = require('../../settings');
let {perpage} = settings.paging;
let dbFn = nkcModules.dbFunction;

smsRouter
  .get(['/','/replies'], async (ctx, next) => {
    let {db} = ctx;
    let {user} = ctx.data;
    let page = ctx.query.page || 0;
    let replies = await db.RepliesModel.find({toUid: user.uid}).sort({toc: -1}).skip(page*perpage).limit(perpage);
    let replieArr = [];
    for (let replie of replies) {
      let fromUser = {};
      let fromPost = await db.PostModel.findOne({pid: replie.fromPid, disabled: false});
      if(fromPost) fromUser = await db.UserModel.findOne({uid: fromPost.uid});
      let toUser = await db.UserModel.findOne({uid: user.uid});
      let toPost = await db.PostModel.findOne({pid: replie.toPid});
      replieArr.push({
        replie,
        fromPost,
        fromUser,
        toUser,
        toPost
      });
    }
    console.log(replieArr);
    await next();
  });

module.exports = smsRouter;