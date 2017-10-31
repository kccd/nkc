const Router = require('koa-router');
const smsRouter = new Router();
const nkcModules = require('../../nkcModules');
const settings = require('../../settings');
let {perpage} = settings.paging;
let apiFn = nkcModules.apiFunction;
let dbFn = nkcModules.dbFunction;
smsRouter
  // 加载与指定用户聊天记录
  .get('/', async (ctx, next) => {
    const {db} = ctx;
    const {user} = ctx.data;
    const uid = ctx.params.uid;
    let page = ctx.query.page || 0;
    ctx.data.targetUser = await UserModel.findOne({uid: uid});
    let docs = (await SmsModel.find().or([{r: user.uid, s: uid}, {s: user.uid, r: uid}]).sort({toc: -1})).toObject();
    let paging = apiFn.paging(page, docs.length);
    let start = paging.start;
    docs = docs.slice(start, start+perpage);
    for (let u of docs) {
      if(u.r === user.uid) {
        u.r = user;
      } else {
        u.r = await UserModel.findOne({uid: u.r});
      }
      if(u.s === user.uid) {
        u.s = user;
      } else {
        u.s = await UserModel.findOne({uid: u.s});
      }
    }
    ctx.date.docs = docs;
    ctx.paging = paging;
    ctx.template = 'interface_messages.pug';
    await next();
  })
  // 给指定用户发送信息
  .post('/', async (ctx, next) => {
    const uid = ctx.params.uid;
    const {content} = ctx.body;
    const {db} = ctx;
    const {user} = ctx.data;
    let smsData = {
      r: uid,
      s: user.uid,
      c: content,
      ip: ctx.ip
    };
    await (new SmsModel(smsData)).save();
    await next();
  });

module.exports = smsRouter;