const Router = require('koa-router');
const smsRouter = new Router();
const nkcModules = require('../../nkcModules');
const settings = require('../../settings');
let {perpage} = settings.paging;
let dbFn = nkcModules.dbFunction;
let apiFn = nkcModules.apiFunction;

smsRouter
  .get(['/','/replies'], async (ctx, next) => {
    let {db} = ctx;
    let {user} = ctx.data;
    let page = ctx.query.page || 0;
    let replies = await db.RepliesModel.find({toUid: user.uid}).sort({toc: -1});
    let repliesLength = replies.length;
    let paging = apiFn.paging(page, repliesLength);
    let start = paging.start;
    replies = replies.slice(start, start+perpage);
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
    ctx.data.paging = paging;
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
    let ats = await db.InviteModel.find({invitee: user.uid}).sort({toc: -1});
    let atsLength = ats.length;
    let paging = apiFn.paging(page, atsLength);
    let start = paging.start;
    ats = ats.slice(start, start+perpage);
    let atsArr = [];
    for (let at of ats) {
      let post = await db.PostModel.findOne({pid: at.pid});
      let user = await db.UserModel.findOne({uid: at.inviter});
      let thread = await db.ThreadModel.findOne({tid: post.tid});
      let oc = await db.PostModel.findOne({pid: thread.oc});
      atsArr.push({
        at,
        post,
        user,
        thread,
        oc
      });
    }
    ctx.data.docs = atsArr;
    ctx.data.paging = paging;
    ctx.data.tab = 'at';
    ctx.template = 'interface_messages.pug';
    await dbFn.decrementPsnl(user.uid, 'at');
    await next();
  })
  .get('/message', async (ctx, next) => {
    /*let {user} = ctx.data;
    let {db} = ctx;
    let page = ctx.query.page || 0;
    let rUser = await SmsModel.aggregate([
      {$match: {$or: [{r: user.uid},{s: user.uid}]}},
      {$group: {_id: '$r', r: {$push: {}}}}
    ]);
    console.log(rUser);
    let messages = await SmsModel.find().or([{r: user.uid}, {s: user.uid}]).sort({toc: -1});
    let docs = [];
    for (let i of messages) {
      let uid = (i.r === user.uid)? i.s: i.r;
      let targetUser = await UserModel.findOne({uid: uid});
      for
    }
    let messagesLength = messages.length;
    let paging = apiFn.paging(page, messagesLength);
    let start = paging.start;
    messages = messages.slice(start, start+perpage);
    let messagesArr = {};
    for (let i of messages) {
      let
    }*/
  });

module.exports = smsRouter;