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
    let start = page*perpage;
    let replies = await db.RepliesModel.find({toUid: user.uid}).sort({toc: -1});
    replies = replies.slice(start, start+perpage);
    let repliesLength = replies.length;
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
    ctx.data.docs = replieArr;
    let pageCount = Math.ceil(repliesLength/perpage);
    ctx.data.paging = {
      page: page,
      perpage: perpage,
      start: start,
      count: 65,
      pageCount: pageCount
    };
    ctx.data.tab = 'replies';
    ctx.template = 'interface_messages.pug';
    await dbFn.decrementPsnl(user.uid, 'replies');
    console.log(ctx.data);
    await next();
  })
  .get('/at', async (ctx, next) => {
    let {user} = ctx.data;
    let {db} = ctx;
    let page = ctx.query.page || 0;
    let start = page*perpage;
    let ats = await db.InviteModel.find({invitee: user.uid}).sort({toc: -1});
    ats = ats.slice(start, start+perpage);
    let atsLength = ats.length;
    let atsArr = [];
    for (let at of ats) {

    }
  });

module.exports = smsRouter;